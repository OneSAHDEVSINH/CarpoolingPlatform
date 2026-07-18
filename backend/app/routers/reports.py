from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking
from app.middleware.auth import get_current_user
from app.schemas.report import ReportSummary
from app.services.report_service import get_user_report_summary
from app.routers.rides import build_ride_response

router = APIRouter()

@router.get("/summary", response_model=ReportSummary)
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    summary = get_user_report_summary(db, current_user.id)
    return ReportSummary(**summary)

@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get completed rides as driver
    driver_rides = db.query(Ride).filter(
        Ride.driver_id == current_user.id, 
        Ride.status == "completed"
    ).all()
    
    # Get completed rides as passenger
    passenger_bookings = db.query(Booking).filter(
        Booking.passenger_id == current_user.id,
        Booking.status == "completed"
    ).all()
    
    passenger_rides = [b.ride for b in passenger_bookings if b.ride]
    
    all_rides = list({r.id: r for r in (driver_rides + passenger_rides)}.values())
    all_rides.sort(key=lambda x: x.created_at, reverse=True)
    
    return [build_ride_response(r, r.driver, r.vehicle) for r in all_rides]
