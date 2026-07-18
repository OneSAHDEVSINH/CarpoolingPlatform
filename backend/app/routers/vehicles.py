from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).filter(Vehicle.owner_id == current_user.id, Vehicle.is_active == True).all()
    return [
        VehicleResponse(
            id=str(v.id), owner_id=str(v.owner_id), model=v.model,
            registration_number=v.registration_number, seating_capacity=v.seating_capacity,
            fuel_type=v.fuel_type, fuel_efficiency=v.fuel_efficiency,
            is_active=v.is_active, created_at=v.created_at
        )
        for v in vehicles
    ]

@router.post("/", response_model=VehicleResponse)
def create_vehicle(data: VehicleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import re
    
    reg_number = data.registration_number.strip().upper()
    
    # Regex check for Indian Number Plate
    pattern = r"^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$"
    if not re.match(pattern, reg_number):
        raise HTTPException(status_code=400, detail="Invalid Indian Registration Number pattern (e.g., GJ01AB1234)")
        
    # Uniqueness check across database
    existing = db.query(Vehicle).filter(Vehicle.registration_number == reg_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists in the database")
    vehicle = Vehicle(
        id=uuid.uuid4(),
        owner_id=current_user.id,
        model=data.model,
        registration_number=reg_number,
        seating_capacity=data.seating_capacity,
        fuel_type=data.fuel_type,
        fuel_efficiency=data.fuel_efficiency
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse(
        id=str(vehicle.id), owner_id=str(vehicle.owner_id), model=vehicle.model,
        registration_number=vehicle.registration_number, seating_capacity=vehicle.seating_capacity,
        fuel_type=vehicle.fuel_type, fuel_efficiency=vehicle.fuel_efficiency,
        is_active=vehicle.is_active, created_at=vehicle.created_at
    )

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: str, data: VehicleUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if str(vehicle.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if data.model is not None:
        vehicle.model = data.model
    if data.registration_number is not None:
        vehicle.registration_number = data.registration_number
    if data.seating_capacity is not None:
        vehicle.seating_capacity = data.seating_capacity
    if data.fuel_type is not None:
        vehicle.fuel_type = data.fuel_type
    if data.fuel_efficiency is not None:
        vehicle.fuel_efficiency = data.fuel_efficiency
        
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse(
        id=str(vehicle.id), owner_id=str(vehicle.owner_id), model=vehicle.model,
        registration_number=vehicle.registration_number, seating_capacity=vehicle.seating_capacity,
        fuel_type=vehicle.fuel_type, fuel_efficiency=vehicle.fuel_efficiency,
        is_active=vehicle.is_active, created_at=vehicle.created_at
    )

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if str(vehicle.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    vehicle.is_active = False
    db.commit()
    return {"status": "success"}
