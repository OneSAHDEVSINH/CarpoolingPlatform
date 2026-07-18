"""
Booking model — a passenger's reservation on a specific ride.

Tracks seats booked, total fare, and current status (confirmed / cancelled / etc.).
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Booking(Base):
    """A passenger's booking for a ride."""

    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ride_id = Column(UUID(as_uuid=True), ForeignKey("rides.id"))
    passenger_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    seats_booked = Column(Integer, default=1)
    total_fare = Column(Float, nullable=False)
    status = Column(String(20), default="confirmed")
    booked_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)

    def __repr__(self) -> str:
        return f"<Booking(id={self.id}, status='{self.status}')>"
