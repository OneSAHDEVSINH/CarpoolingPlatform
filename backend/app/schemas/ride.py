"""
Ride-related Pydantic v2 schemas.

Covers location points, route calculations, ride creation/search, and
API responses including embedded driver and vehicle info.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LocationPoint(BaseModel):
    """A geographic coordinate with an optional human-readable address."""

    lat: float
    lng: float
    address: Optional[str] = None


class RouteRequest(BaseModel):
    """Request schema for computing a route between two points."""

    pickup: LocationPoint
    destination: LocationPoint


class RouteResponse(BaseModel):
    """Computed route details returned by the routing engine."""

    distance_km: float
    duration_min: int
    polyline: List[List[float]]
    pickup_address: Optional[str] = None
    destination_address: Optional[str] = None


class RideCreate(BaseModel):
    """Schema for a driver to publish a new ride offer."""

    pickup: LocationPoint
    destination: LocationPoint
    travel_date: str
    travel_time: str
    vehicle_id: str
    available_seats: int
    fare_per_seat: float
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    route_polyline: Optional[List[List[float]]] = None
    distance_km: Optional[float] = None
    estimated_duration_min: Optional[int] = None


class RideSearch(BaseModel):
    """Schema for passengers searching available rides."""

    pickup: LocationPoint
    destination: LocationPoint
    date: str
    time: Optional[str] = None
    seats: int = 1


class DriverInfo(BaseModel):
    """Brief driver summary embedded in ride/trip responses."""

    id: str
    name: str
    avatar_url: Optional[str] = None
    rating: Optional[float] = 4.5


class VehicleBrief(BaseModel):
    """Minimal vehicle info embedded in ride/trip responses."""

    model: str
    registration_number: str


class RideResponse(BaseModel):
    """Full ride data returned by the API."""

    id: str
    driver: DriverInfo
    vehicle: VehicleBrief
    pickup_address: Optional[str] = None
    destination_address: Optional[str] = None
    pickup_lat: float
    pickup_lng: float
    destination_lat: float
    destination_lng: float
    route_polyline: Optional[list] = None
    travel_date: str
    travel_time: str
    available_seats: int
    total_seats: int
    fare_per_seat: float
    distance_km: Optional[float] = None
    estimated_duration_min: Optional[int] = None
    is_recurring: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
