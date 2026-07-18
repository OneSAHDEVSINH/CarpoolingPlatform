"""
Trip model — the live/in-progress state of a ride.

Created when a driver starts a ride.  Stores real-time GPS coordinates
and lifecycle timestamps (started_at, completed_at).
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Trip(Base):
    """Live trip instance tied one-to-one with a ride."""

    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ride_id = Column(UUID(as_uuid=True), ForeignKey("rides.id"), unique=True)
    status = Column(String(30), default="booked")

    # --- Live Location ---
    live_lat = Column(Float, nullable=True)
    live_lng = Column(Float, nullable=True)
    location_updated_at = Column(DateTime, nullable=True)

    # --- Lifecycle ---
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    ride = relationship("Ride", back_populates="trip")
    chat_messages = relationship("ChatMessage", back_populates="trip")

    def __repr__(self) -> str:
        return f"<Trip(id={self.id}, status='{self.status}')>"
