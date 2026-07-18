"""
Vehicle-related Pydantic v2 schemas.

Covers vehicle creation, updates, and API responses.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehicleCreate(BaseModel):
    """Schema for registering a new vehicle."""

    model: str
    registration_number: str
    seating_capacity: int
    fuel_type: str = "Petrol"
    fuel_efficiency: Optional[float] = None


class VehicleUpdate(BaseModel):
    """Schema for partial vehicle updates."""

    model: Optional[str] = None
    registration_number: Optional[str] = None
    seating_capacity: Optional[int] = None
    fuel_type: Optional[str] = None
    fuel_efficiency: Optional[float] = None


class VehicleResponse(BaseModel):
    """Vehicle data returned by the API."""

    id: str
    owner_id: str
    model: str
    registration_number: str
    seating_capacity: int
    fuel_type: str
    fuel_efficiency: Optional[float] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
