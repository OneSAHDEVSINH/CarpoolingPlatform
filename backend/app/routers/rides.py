from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.models.ride import Ride
from app.models.trip import Trip
from app.models.user import User
from app.schemas.ride import RideSearch, RideCreate, RideResponse, RouteRequest, RouteResponse, DriverInfo, VehicleBrief
from app.middleware.auth import get_current_user
from app.services.ride_service import search_matching_rides
from app.services.route_service import calculate_route, reverse_geocode

router = APIRouter()

def build_ride_response(ride, driver, vehicle):
    return RideResponse(
        id=str(ride.id),
        driver=DriverInfo(id=str(driver.id), name=driver.name, avatar_url=driver.avatar_url),
        vehicle=VehicleBrief(model=vehicle.model, registration_number=vehicle.registration_number),
        pickup_address=ride.pickup_address,
        destination_address=ride.destination_address,
        pickup_lat=ride.pickup_lat,
        pickup_lng=ride.pickup_lng,
        destination_lat=ride.destination_lat,
        destination_lng=ride.destination_lng,
        route_polyline=ride.route_polyline,
        travel_date=str(ride.travel_date),
        travel_time=str(ride.travel_time),
        available_seats=ride.available_seats,
        total_seats=ride.total_seats,
        fare_per_seat=ride.fare_per_seat,
        distance_km=ride.distance_km,
        estimated_duration_min=ride.estimated_duration_min,
        is_recurring=ride.is_recurring,
        status=ride.status,
        created_at=ride.created_at
    )

@router.post("/search", response_model=List[RideResponse])
def search_rides(data: RideSearch, db: Session = Depends(get_db)):
    try:
        travel_date = datetime.strptime(data.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    matches = search_matching_rides(
        db=db,
        pickup_lat=data.pickup.lat,
        pickup_lng=data.pickup.lng,
        dest_lat=data.destination.lat,
        dest_lng=data.destination.lng,
        travel_date=travel_date,
        seats_needed=data.seats
    )
    
    return [build_ride_response(match["ride"], match["driver"], match["vehicle"]) for match in matches]

@router.post("/", response_model=RideResponse)
def publish_ride(data: RideCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        travel_date = datetime.strptime(data.travel_date, "%Y-%m-%d").date()
        travel_time = datetime.strptime(data.travel_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date/time format")
        
    ride = Ride(
        id=uuid.uuid4(),
        driver_id=current_user.id,
        vehicle_id=data.vehicle_id, # Requires cast if using UUID directly in input, assumes valid
        pickup_lat=data.pickup.lat,
        pickup_lng=data.pickup.lng,
        pickup_address=data.pickup.address,
        destination_lat=data.destination.lat,
        destination_lng=data.destination.lng,
        destination_address=data.destination.address,
        route_polyline=data.route_polyline,
        distance_km=data.distance_km,
        estimated_duration_min=data.estimated_duration_min,
        travel_date=travel_date,
        travel_time=travel_time,
        total_seats=data.available_seats,
        available_seats=data.available_seats,
        fare_per_seat=data.fare_per_seat,
        is_recurring=data.is_recurring,
        recurrence_pattern=data.recurrence_pattern
    )
    db.add(ride)
    
    trip = Trip(
        id=uuid.uuid4(),
        ride_id=ride.id,
        status="scheduled"
    )
    db.add(trip)
    
    db.commit()
    db.refresh(ride)
    
    # We could fetch vehicle directly here instead of using relationships for simplicity if needed
    driver = current_user
    vehicle = ride.vehicle
    return build_ride_response(ride, driver, vehicle)

@router.get("/my", response_model=List[RideResponse])
def list_my_rides(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rides = db.query(Ride).filter(Ride.driver_id == current_user.id).order_by(Ride.created_at.desc()).all()
    return [build_ride_response(r, current_user, r.vehicle) for r in rides]

@router.get("/{ride_id}", response_model=RideResponse)
def get_ride(ride_id: str, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return build_ride_response(ride, ride.driver, ride.vehicle)

@router.delete("/{ride_id}")
def cancel_ride(ride_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if str(ride.driver_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    ride.status = 'cancelled'
    
    if ride.trip:
        ride.trip.status = 'cancelled'
        
    db.commit()
    return {"status": "success"}

@router.post("/route/calculate", response_model=RouteResponse)
async def calc_route(data: RouteRequest):
    try:
        res = await calculate_route(
            data.pickup.lat, data.pickup.lng,
            data.destination.lat, data.destination.lng
        )
        return RouteResponse(
            distance_km=res["distance_km"],
            duration_min=res["duration_min"],
            polyline=res["polyline"],
            pickup_address=None,
            destination_address=None
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
