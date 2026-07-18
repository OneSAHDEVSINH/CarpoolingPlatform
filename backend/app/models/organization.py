"""
Organization model — represents a corporate entity whose employees use the platform.

Each organization has a unique email domain used for automatic affiliation
and a JSON settings column for org-specific configuration (e.g. fuel_cost_per_km).
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Organization(Base):
    """Corporate organization that groups users on the platform."""

    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True)
    settings = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    users = relationship("User", back_populates="organization")

    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, name='{self.name}')>"
