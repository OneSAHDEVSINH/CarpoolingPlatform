from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.wallet import Wallet, WalletTransaction
from app.models.user import User
from app.models.trip import Trip
from app.middleware.auth import get_current_user
from app.schemas.payment import PaymentCreate, PaymentVerify, PaymentResponse
from app.services.payment_service import create_razorpay_order, verify_razorpay_payment

router = APIRouter()

@router.post("/", response_model=PaymentResponse)
def create_payment(data: PaymentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Can only pay for completed bookings")
        
    payment = Payment(
        id=uuid.uuid4(),
        booking_id=booking.id,
        payer_id=current_user.id,
        payee_id=booking.ride.driver_id,
        amount=data.amount,
        method=data.method,
    )
    
    trip = db.query(Trip).filter(Trip.ride_id == booking.ride_id).first()
    
    razorpay_order_id = None
    
    if data.method == 'cash':
        payment.status = 'completed'
        payment.paid_at = datetime.utcnow()
        if trip:
            trip.status = 'payment_completed'
    
    elif data.method in ('card', 'upi'):
        order = create_razorpay_order(data.amount)
        if order and not order.get("mock"):
            razorpay_order_id = order["id"]
            payment.razorpay_order_id = razorpay_order_id
            payment.status = 'pending'
        else:
            # Mock success for dev
            payment.status = 'completed'
            payment.paid_at = datetime.utcnow()
            if trip:
                trip.status = 'payment_completed'
                
    elif data.method == 'wallet':
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
        if not wallet or wallet.balance < data.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
            
        wallet.balance -= data.amount
        tx = WalletTransaction(
            id=uuid.uuid4(),
            wallet_id=wallet.id,
            amount=data.amount,
            type='debit',
            description=f"Payment for ride {booking.ride_id}"
        )
        db.add(tx)
        
        # Credit driver's wallet
        driver_wallet = db.query(Wallet).filter(Wallet.user_id == booking.ride.driver_id).first()
        if driver_wallet:
            driver_wallet.balance += data.amount
            dtx = WalletTransaction(
                id=uuid.uuid4(),
                wallet_id=driver_wallet.id,
                amount=data.amount,
                type='credit',
                description=f"Received for ride {booking.ride_id}"
            )
            db.add(dtx)
            
        payment.status = 'completed'
        payment.paid_at = datetime.utcnow()
        if trip:
            trip.status = 'payment_completed'

    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return PaymentResponse(
        id=str(payment.id),
        booking_id=str(payment.booking_id),
        amount=payment.amount,
        method=payment.method,
        status=payment.status,
        transaction_id=payment.transaction_id,
        razorpay_order_id=payment.razorpay_order_id,
        paid_at=payment.paid_at,
        created_at=payment.created_at
    )

@router.post("/verify")
def verify_payment(data: PaymentVerify, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if verify_razorpay_payment(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature):
        payment = db.query(Payment).filter(Payment.razorpay_order_id == data.razorpay_order_id).first()
        if payment:
            payment.status = 'completed'
            payment.transaction_id = data.razorpay_payment_id
            payment.paid_at = datetime.utcnow()
            
            trip = db.query(Trip).join(Booking).filter(Booking.id == payment.booking_id).first()
            if trip:
                trip.status = 'payment_completed'
                
            db.commit()
            return {"status": "success"}
    
    raise HTTPException(status_code=400, detail="Payment verification failed")
