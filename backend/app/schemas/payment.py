"""
Payment and wallet Pydantic v2 schemas.

Covers payment creation, Razorpay verification, wallet operations,
and transaction history.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentCreate(BaseModel):
    """Schema for initiating a payment."""

    booking_id: str
    method: str  # cash | card | upi | wallet
    amount: float


class PaymentVerify(BaseModel):
    """Schema for verifying a Razorpay payment callback."""

    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    """Payment data returned by the API."""

    id: str
    booking_id: str
    amount: float
    method: str
    status: str
    transaction_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WalletResponse(BaseModel):
    """Current wallet balance returned by the API."""

    id: str
    balance: float
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WalletRecharge(BaseModel):
    """Schema for adding funds to the wallet."""

    amount: float


class WalletPay(BaseModel):
    """Schema for paying a booking via wallet balance."""

    booking_id: str
    amount: float


class WalletTransactionResponse(BaseModel):
    """Single wallet transaction record returned by the API."""

    id: str
    amount: float
    type: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
