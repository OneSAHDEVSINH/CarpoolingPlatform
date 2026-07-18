"""
Ride model — a carpooling ride offered by a driver.

Contains origin/destination coordinates, schedule, seat/fare info,
optional recurring pattern, and route polyline stored as JSON.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Date, Time, JSON, ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Ride(Base):
    """A ride offered by a driver from pickup to destination."""

    __tablename__ = "rides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"))

    # --- Location ---
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    pickup_address = Column(String(500))
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    destination_address = Column(String(500))
    route_polyline = Column(JSON, nullable=True)

    # --- Distance & Duration ---
    distance_km = Column(Float)
    estimated_duration_min = Column(Integer)

    # --- Schedule ---
    travel_date = Column(Date, nullable=False)
    travel_time = Column(Time, nullable=False)

    # --- Seats & Fare ---
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    fare_per_seat = Column(Float, nullable=False)

    # --- Recurrence ---
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50), nullable=True)

    # --- Status & Timestamp ---
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    driver = relationship("User", back_populates="rides")
    vehicle = relationship("Vehicle")
    bookings = relationship("Booking", back_populates="ride")
    trip = relationship("Trip", back_populates="ride", uselist=False)

    def __repr__(self) -> str:
        return f"<Ride(id={self.id}, status='{self.status}')>"
