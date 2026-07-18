from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.database import get_db
from app.models.trip import Trip
from app.models.ride import Ride
from app.models.booking import Booking
from app.models.user import User
from app.models.chat import ChatMessage
from app.middleware.auth import get_current_user
from app.schemas.trip import TripResponse, LocationUpdate, ChatMessageCreate, ChatMessageResponse, PassengerInfo
from app.schemas.ride import DriverInfo, VehicleBrief
from fastapi import BackgroundTasks
from app.routers.websocket_rt import notifier

router = APIRouter()

def build_trip_response(trip):
    ride = trip.ride
    driver = ride.driver
    vehicle = ride.vehicle
    
    passengers = []
    for b in ride.bookings:
        if b.status != "cancelled":
            passengers.append(PassengerInfo(
                id=str(b.passenger.id),
                name=b.passenger.name,
                seats_booked=b.seats_booked
            ))
            
    return TripResponse(
        id=str(trip.id),
        ride_id=str(ride.id),
        status=trip.status,
        driver=DriverInfo(id=str(driver.id), name=driver.name, avatar_url=driver.avatar_url),
        passengers=passengers,
        vehicle=VehicleBrief(model=vehicle.model, registration_number=vehicle.registration_number),
        pickup_address=ride.pickup_address,
        destination_address=ride.destination_address,
        pickup_lat=ride.pickup_lat,
        pickup_lng=ride.pickup_lng,
        destination_lat=ride.destination_lat,
        destination_lng=ride.destination_lng,
        travel_date=str(ride.travel_date),
        travel_time=str(ride.travel_time),
        fare_per_seat=ride.fare_per_seat,
        distance_km=ride.distance_km,
        estimated_duration_min=ride.estimated_duration_min,
        live_lat=trip.live_lat,
        live_lng=trip.live_lng,
        started_at=trip.started_at,
        completed_at=trip.completed_at,
        created_at=trip.created_at
    )

@router.get("/my", response_model=List[TripResponse])
def get_my_trips(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Trips as driver
    driver_trips = db.query(Trip).join(Ride).filter(Ride.driver_id == current_user.id).all()
    
    # Trips as passenger
    passenger_trips = db.query(Trip).join(Ride).join(Booking).filter(
        Booking.passenger_id == current_user.id,
        Booking.status != "cancelled"
    ).all()
    
    all_trips = list({t.id: t for t in (driver_trips + passenger_trips)}.values())
    all_trips.sort(key=lambda x: x.created_at, reverse=True)
    
    return [build_trip_response(t) for t in all_trips]

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return build_trip_response(trip)

@router.put("/{trip_id}/start")
def start_trip(trip_id: str, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if str(trip.ride.driver_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only driver can start trip")
        
    trip.status = "started"
    trip.started_at = datetime.utcnow()
    db.commit()
    
    for booking in trip.ride.bookings:
        if booking.status != "cancelled":
            background_tasks.add_task(notifier.send_personal_message, str(booking.passenger_id), {
                "type": "TRIP_STARTED",
                "title": "Trip Started!",
                "message": f"Your driver {current_user.name} has started the trip."
            })
            
    return {"status": trip.status}

@router.put("/{trip_id}/complete")
def complete_trip(trip_id: str, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if str(trip.ride.driver_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only driver can complete trip")
        
    active_bookings = [b for b in trip.ride.bookings if b.status != 'cancelled']
    if len(active_bookings) > 0 and trip.status != 'started':
        raise HTTPException(status_code=400, detail="Trip with passengers must be started before it can be completed")
        
    trip.status = "payment_pending"
    trip.completed_at = datetime.utcnow()
    
    for booking in trip.ride.bookings:
        if booking.status == "confirmed":
            booking.status = "completed"
            
    trip.ride.status = "completed"
    
    db.commit()
    
    for booking in trip.ride.bookings:
        if booking.status == "completed":
            background_tasks.add_task(notifier.send_personal_message, str(booking.passenger_id), {
                "type": "TRIP_COMPLETED",
                "title": "Trip Completed!",
                "message": f"Your trip with {current_user.name} has ended. Please check payment status."
            })
            
    return {"status": trip.status}

@router.put("/{trip_id}/location")
def update_location(trip_id: str, data: LocationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    trip.live_lat = data.lat
    trip.live_lng = data.lng
    trip.location_updated_at = datetime.utcnow()
    db.commit()
    return {"status": "updated"}

@router.get("/{trip_id}/chat", response_model=List[ChatMessageResponse])
def get_chat(trip_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.trip_id == trip_id).order_by(ChatMessage.sent_at.asc()).all()
    return [
        ChatMessageResponse(
            id=str(m.id),
            trip_id=str(m.trip_id),
            sender_id=str(m.sender_id),
            sender_name=m.sender.name,
            message=m.message,
            sent_at=m.sent_at
        )
        for m in messages
    ]

@router.post("/{trip_id}/chat", response_model=ChatMessageResponse)
def send_chat(trip_id: str, data: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = ChatMessage(
        id=uuid.uuid4(),
        trip_id=trip_id, # Assumes valid UUID
        sender_id=current_user.id,
        message=data.message
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    return ChatMessageResponse(
        id=str(msg.id),
        trip_id=str(msg.trip_id),
        sender_id=str(msg.sender_id),
        sender_name=current_user.name,
        message=msg.message,
        sent_at=msg.sent_at
    )
