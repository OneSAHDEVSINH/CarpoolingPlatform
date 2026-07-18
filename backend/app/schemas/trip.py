"""
Trip-related Pydantic v2 schemas.

Covers active trip tracking, live location updates, in-trip chat,
and passenger info.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.schemas.ride import DriverInfo, VehicleBrief


class PassengerInfo(BaseModel):
    """Brief passenger summary embedded in trip responses."""

    id: str
    name: str
    seats_booked: int


class TripResponse(BaseModel):
    """Full trip data returned by the API."""

    id: str
    ride_id: str
    status: str
    driver: Optional[DriverInfo] = None
    passengers: Optional[List[PassengerInfo]] = None
    vehicle: Optional[VehicleBrief] = None
    pickup_address: Optional[str] = None
    destination_address: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    travel_date: Optional[str] = None
    travel_time: Optional[str] = None
    fare_per_seat: Optional[float] = None
    distance_km: Optional[float] = None
    estimated_duration_min: Optional[int] = None
    live_lat: Optional[float] = None
    live_lng: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LocationUpdate(BaseModel):
    """Schema for driver pushing live GPS coordinates."""

    lat: float
    lng: float


class ChatMessageCreate(BaseModel):
    """Schema for sending a new chat message within a trip."""

    message: str


class ChatMessageResponse(BaseModel):
    """Chat message data returned by the API."""

    id: str
    trip_id: str
    sender_id: str
    sender_name: Optional[str] = None
    message: str
    sent_at: datetime

    class Config:
        from_attributes = True
