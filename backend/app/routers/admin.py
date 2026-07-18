from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.models.ride import Ride
from app.models.trip import Trip
from app.middleware.auth import get_current_admin
from app.schemas.user import UserProfile

router = APIRouter()

class StatusUpdate(BaseModel):
    is_active: bool

@router.get("/employees", response_model=List[UserProfile])
def get_employees(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.org_id == current_admin.org_id).all()
    return [
        UserProfile(
            id=str(u.id), name=u.name, email=u.email, phone=u.phone,
            role=u.role, org_id=str(u.org_id), avatar_url=u.avatar_url,
            saved_places=u.saved_places, created_at=u.created_at
        ) for u in users
    ]

@router.put("/employees/{user_id}/status")
def update_employee_status(user_id: str, data: StatusUpdate, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.id == user_id, User.org_id == current_admin.org_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    user.is_active = data.is_active
    db.commit()
    return {"status": "success", "is_active": user.is_active}

@router.get("/org/settings")
def get_org_settings(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_admin.org_id).first()
    return org.settings or {}

@router.put("/org/settings")
def update_org_settings(settings: dict, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_admin.org_id).first()
    org.settings = settings
    db.commit()
    return org.settings

@router.get("/stats")
def get_org_stats(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.org_id == current_admin.org_id).count()
    
    # Simple org-wide stats (assumes all rides by org members belong to org)
    total_rides = db.query(Ride).join(User).filter(User.org_id == current_admin.org_id).count()
    active_rides = db.query(Ride).join(User).filter(User.org_id == current_admin.org_id, Ride.status == "active").count()
    
    return {
        "total_users": total_users,
        "total_rides": total_rides,
        "active_rides": active_rides
    }
