"""
Vehicle model — represents a car registered by a driver on the platform.

Tracks registration details, seating capacity, and fuel information used
for fare estimation.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Vehicle(Base):
    """A vehicle owned by a user / driver."""

    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    model = Column(String(255), nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    seating_capacity = Column(Integer, nullable=False)
    fuel_type = Column(String(20), default="Petrol")
    fuel_efficiency = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    owner = relationship("User", back_populates="vehicles")

    def __repr__(self) -> str:
        return f"<Vehicle(id={self.id}, reg='{self.registration_number}')>"
