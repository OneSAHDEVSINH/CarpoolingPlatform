"""
ChatMessage model — in-trip messaging between ride participants.

Messages are scoped to a trip so that chat history is only available
while the trip is active or recently completed.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ChatMessage(Base):
    """A single chat message sent during a trip."""

    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"))
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    trip = relationship("Trip", back_populates="chat_messages")
    sender = relationship("User")

    def __repr__(self) -> str:
        return f"<ChatMessage(id={self.id}, trip_id={self.trip_id})>"
