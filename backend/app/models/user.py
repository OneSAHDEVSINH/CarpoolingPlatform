"""
User model — central identity for employees, drivers, and admins.

Stores credentials, profile information, and saved places.  Linked to an
organization via org_id and owns vehicles, rides, bookings, and a wallet.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """Platform user (employee / driver / admin)."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    role = Column(String(20), default="employee")
    avatar_url = Column(String(500), nullable=True)
    saved_places = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    organization = relationship("Organization", back_populates="users")
    vehicles = relationship("Vehicle", back_populates="owner")
    rides = relationship("Ride", back_populates="driver")
    bookings = relationship("Booking", back_populates="passenger")
    wallet = relationship("Wallet", back_populates="user", uselist=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
