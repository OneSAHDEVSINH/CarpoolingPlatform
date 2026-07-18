from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.booking import Booking
from app.models.ride import Ride
from app.models.user import User
from app.middleware.auth import get_current_user

# Reusing RideResponse for simplicity or could create a specific BookingResponse
from app.schemas.ride import RideResponse

router = APIRouter()

@router.post("/")
def book_ride(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ride_id = data.get("ride_id")
    seats = data.get("seats", 1)
    
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
        
    if ride.available_seats < seats:
        raise HTTPException(status_code=400, detail="Not enough seats available")
        
    if str(ride.driver_id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot book your own ride")
        
    total_fare = seats * ride.fare_per_seat
    
    booking = Booking(
        id=uuid.uuid4(),
        ride_id=ride.id,
        passenger_id=current_user.id,
        seats_booked=seats,
        total_fare=total_fare,
        status="confirmed"
    )
    db.add(booking)
    
    ride.available_seats -= seats
    if ride.available_seats == 0:
        ride.status = "full"
        
    db.commit()
    db.refresh(booking)
    
    return {
        "id": str(booking.id),
        "ride_id": str(booking.ride_id),
        "seats_booked": booking.seats_booked,
        "total_fare": booking.total_fare,
        "status": booking.status
    }

@router.get("/my")
def list_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.passenger_id == current_user.id).order_by(Booking.booked_at.desc()).all()
    
    res = []
    for b in bookings:
        # Assuming RideResponse can handle it or we return a dict
        res.append({
            "booking_id": str(b.id),
            "seats": b.seats_booked,
            "total_fare": b.total_fare,
            "status": b.status,
            "ride": {
                "id": str(b.ride.id),
                "pickup_address": b.ride.pickup_address,
                "destination_address": b.ride.destination_address,
                "travel_date": str(b.ride.travel_date),
                "travel_time": str(b.ride.travel_time)
            }
        })
    return res

@router.put("/{booking_id}/cancel")
def cancel_booking(booking_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if str(booking.passenger_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if booking.status == "cancelled":
        return {"status": "already cancelled"}
        
    booking.status = "cancelled"
    
    # Restore seats
    ride = booking.ride
    ride.available_seats += booking.seats_booked
    if ride.status == "full":
        ride.status = "active"
        
    db.commit()
    return {"status": "success"}
