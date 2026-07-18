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
    users = db.query(User).all()
    return [
        UserProfile(
            id=str(u.id), name=u.name, email=u.email, phone=u.phone,
            role=u.role, org_id=str(u.org_id), avatar_url=u.avatar_url,
            saved_places=u.saved_places, created_at=u.created_at
        ) for u in users
    ]

@router.put("/employees/{user_id}/status")
def update_employee_status(user_id: str, data: StatusUpdate, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    user.is_active = data.is_active
    db.commit()
    return {"status": "success", "is_active": user.is_active}

@router.get("/org/vehicles")
def get_org_vehicles(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    from app.models.vehicle import Vehicle
    vehicles = db.query(Vehicle).all()
    
    # Map to the format expected by the frontend
    result = []
    for v in vehicles:
        result.append({
            "id": str(v.id),
            "registrationNumber": v.registration_number,
            "model": v.model,
            "seatingCapacity": v.seating_capacity,
            "assignedDriver": v.owner.name if v.owner else "Unknown",
            "approvalStatus": "approved" if v.is_active else "pending"
        })
    return result

@router.post("/org/vehicles")
def add_org_vehicle(data: dict, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    from app.models.vehicle import Vehicle
    import uuid
    import re
    from fastapi import HTTPException
    
    reg_number = data.get('registrationNumber', '').strip().upper()
    
    # 1. Regex check for Indian Number Plate
    pattern = r"^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$"
    if not re.match(pattern, reg_number):
        raise HTTPException(status_code=400, detail="Invalid Indian Registration Number pattern (e.g., GJ01AB1234)")
        
    # 2. Uniqueness check across database
    existing = db.query(Vehicle).filter(Vehicle.registration_number == reg_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists in the database")
    
    # Use provided owner_id or fallback to admin
    owner_id = data.get('owner_id')
    if not owner_id:
        owner_id = current_admin.id
        
    new_v = Vehicle(
        id=uuid.uuid4(),
        owner_id=owner_id,
        model=data.get('model', 'Corporate Vehicle'),
        registration_number=reg_number,
        seating_capacity=data.get('seatingCapacity', 4),
        fuel_type='Petrol',
        is_active=True
    )
    db.add(new_v)
    db.commit()
    db.refresh(new_v)
    
    return {
        "id": str(new_v.id),
        "registrationNumber": new_v.registration_number,
        "model": new_v.model,
        "seatingCapacity": new_v.seating_capacity,
        "assignedDriver": new_v.owner.name if new_v.owner else current_admin.name,
        "approvalStatus": "approved"
    }

@router.put("/org/vehicles/{vehicle_id}/status")
def update_vehicle_status(vehicle_id: str, data: dict, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    from app.models.vehicle import Vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle:
        vehicle.is_active = (data.get('status') == 'approved')
        db.commit()
    return {"status": "success"}

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
