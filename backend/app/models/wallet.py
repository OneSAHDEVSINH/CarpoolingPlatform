"""
Wallet models — in-app wallet and its transaction ledger.

Each user has exactly one wallet.  Every credit/debit is recorded as a
WalletTransaction for full auditability.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Wallet(Base):
    """In-app wallet linked one-to-one with a user."""

    __tablename__ = "wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    balance = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships ---
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet")

    def __repr__(self) -> str:
        return f"<Wallet(id={self.id}, balance={self.balance})>"


class WalletTransaction(Base):
    """Individual credit or debit entry in a wallet's ledger."""

    __tablename__ = "wallet_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"))
    amount = Column(Float, nullable=False)
    type = Column(String(10))
    description = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    wallet = relationship("Wallet", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<WalletTransaction(id={self.id}, type='{self.type}', amount={self.amount})>"
