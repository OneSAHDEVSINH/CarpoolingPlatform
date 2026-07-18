"""
Payment model — financial transaction for a booking.

Supports multiple payment methods and stores Razorpay integration IDs
for payment gateway reconciliation.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Payment(Base):
    """Payment record for a booking between payer (passenger) and payee (driver)."""

    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    payer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    payee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    method = Column(String(20))
    status = Column(String(20), default="pending")
    transaction_id = Column(String(255), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    booking = relationship("Booking", back_populates="payment")
    payer = relationship("User", foreign_keys=[payer_id])
    payee = relationship("User", foreign_keys=[payee_id])

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, amount={self.amount}, status='{self.status}')>"
