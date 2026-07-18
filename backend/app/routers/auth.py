from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import UserRegister, UserLogin, UserProfile, UserProfileUpdate, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    org_id = None
    if data.org_id:
        org = db.query(Organization).filter(Organization.id == data.org_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        org_id = org.id
    elif data.org_name:
        org = Organization(id=uuid.uuid4(), name=data.org_name, domain=data.email.split('@')[1])
        db.add(org)
        db.flush()
        org_id = org.id
    else:
        domain = data.email.split('@')[1]
        org = db.query(Organization).filter(Organization.domain == domain).first()
        if not org:
            org = Organization(id=uuid.uuid4(), name=domain.split('.')[0].title(), domain=domain)
            db.add(org)
            db.flush()
        org_id = org.id
    
    user = User(
        id=uuid.uuid4(),
        org_id=org_id,
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        phone=data.phone,
        role='employee',
    )
    db.add(user)
    
    wallet = Wallet(id=uuid.uuid4(), user_id=user.id, balance=0.0)
    db.add(wallet)
    
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": str(user.id)})
    
    return TokenResponse(
        token=token,
        user=UserProfile(
            id=str(user.id), name=user.name, email=user.email,
            phone=user.phone, role=user.role, org_id=str(user.org_id),
            avatar_url=user.avatar_url, saved_places=user.saved_places,
            created_at=user.created_at,
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        token=token,
        user=UserProfile(
            id=str(user.id), name=user.name, email=user.email,
            phone=user.phone, role=user.role, org_id=str(user.org_id),
            avatar_url=user.avatar_url, saved_places=user.saved_places,
            created_at=user.created_at,
        )
    )

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=str(current_user.id), name=current_user.name, email=current_user.email,
        phone=current_user.phone, role=current_user.role, org_id=str(current_user.org_id),
        avatar_url=current_user.avatar_url, saved_places=current_user.saved_places,
        created_at=current_user.created_at,
    )

@router.put("/profile", response_model=UserProfile)
def update_profile(data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.saved_places is not None:
        current_user.saved_places = [sp.model_dump() for sp in data.saved_places]
    db.commit()
    db.refresh(current_user)
    return UserProfile(
        id=str(current_user.id), name=current_user.name, email=current_user.email,
        phone=current_user.phone, role=current_user.role, org_id=str(current_user.org_id),
        avatar_url=current_user.avatar_url, saved_places=current_user.saved_places,
        created_at=current_user.created_at,
    )
