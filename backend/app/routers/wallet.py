from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.wallet import Wallet, WalletTransaction
from app.models.user import User
from app.middleware.auth import get_current_user
from app.schemas.payment import WalletResponse, WalletRecharge, WalletTransactionResponse

router = APIRouter()

@router.get("/", response_model=WalletResponse)
def get_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(id=uuid.uuid4(), user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        
    return WalletResponse(
        id=str(wallet.id),
        balance=wallet.balance,
        updated_at=wallet.updated_at
    )

@router.post("/recharge", response_model=WalletResponse)
def recharge_wallet(data: WalletRecharge, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
        
    # In a real app, this would integrate with Razorpay before crediting
    wallet.balance += data.amount
    
    tx = WalletTransaction(
        id=uuid.uuid4(),
        wallet_id=wallet.id,
        amount=data.amount,
        type="credit",
        description="Wallet Recharge"
    )
    db.add(tx)
    db.commit()
    db.refresh(wallet)
    
    return WalletResponse(
        id=str(wallet.id),
        balance=wallet.balance,
        updated_at=wallet.updated_at
    )

@router.get("/transactions", response_model=List[WalletTransactionResponse])
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return []
        
    txs = db.query(WalletTransaction).filter(WalletTransaction.wallet_id == wallet.id).order_by(WalletTransaction.created_at.desc()).all()
    
    return [
        WalletTransactionResponse(
            id=str(tx.id),
            amount=tx.amount,
            type=tx.type,
            description=tx.description,
            created_at=tx.created_at
        )
        for tx in txs
    ]
