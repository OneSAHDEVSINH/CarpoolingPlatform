import os
import sys
import uuid
from datetime import datetime, date, time, timedelta

from app.database import SessionLocal, engine, Base
from app.models.organization import Organization
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.ride import Ride
from app.models.booking import Booking
from app.models.trip import Trip
from app.models.wallet import Wallet
from app.utils.security import hash_password

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(Organization).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding Organizations...")
        org1 = Organization(id=uuid.uuid4(), name="TechCorp", domain="techcorp.com")
        org2 = Organization(id=uuid.uuid4(), name="DataSoft", domain="datasoft.com")
        db.add_all([org1, org2])
        db.commit()

        print("Seeding Users...")
        # Admins
        admin1 = User(id=uuid.uuid4(), org_id=org1.id, name="Admin TechCorp", email="admin@techcorp.com", password_hash=hash_password("password123"), role="admin", is_active=True)
        admin2 = User(id=uuid.uuid4(), org_id=org2.id, name="Admin DataSoft", email="admin@datasoft.com", password_hash=hash_password("password123"), role="admin", is_active=True)
        
        # Employees (TechCorp)
        emp1 = User(id=uuid.uuid4(), org_id=org1.id, name="Rahul Sharma", email="rahul@techcorp.com", phone="9876543210", password_hash=hash_password("password123"), role="employee")
        emp2 = User(id=uuid.uuid4(), org_id=org1.id, name="Priya Patel", email="priya@techcorp.com", phone="9876543211", password_hash=hash_password("password123"), role="employee")
        emp3 = User(id=uuid.uuid4(), org_id=org1.id, name="Amit Kumar", email="amit@techcorp.com", phone="9876543212", password_hash=hash_password("password123"), role="employee")
        
        # Employees (DataSoft)
        emp4 = User(id=uuid.uuid4(), org_id=org2.id, name="Sneha Desai", email="sneha@datasoft.com", phone="9876543213", password_hash=hash_password("password123"), role="employee")
        emp5 = User(id=uuid.uuid4(), org_id=org2.id, name="Vikram Singh", email="vikram@datasoft.com", phone="9876543214", password_hash=hash_password("password123"), role="employee")
        
        users = [admin1, admin2, emp1, emp2, emp3, emp4, emp5]
        db.add_all(users)
        
        # Create wallets
        for u in users:
            db.add(Wallet(id=uuid.uuid4(), user_id=u.id, balance=1000.0))
            
        db.commit()

        print("Seeding Vehicles...")
        v1 = Vehicle(id=uuid.uuid4(), owner_id=emp1.id, model="Toyota Camry", registration_number="MH-12-AB-1234", seating_capacity=4, fuel_efficiency=15.0)
        v2 = Vehicle(id=uuid.uuid4(), owner_id=emp3.id, model="Hyundai Creta", registration_number="MH-14-CD-5678", seating_capacity=4, fuel_efficiency=18.0)
        v3 = Vehicle(id=uuid.uuid4(), owner_id=emp4.id, model="Honda City", registration_number="MH-12-EF-9012", seating_capacity=4, fuel_efficiency=16.5)
        db.add_all([v1, v2, v3])
        db.commit()

        print("Seeding Rides & Trips...")
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        # Ride 1: Active
        r1 = Ride(
            id=uuid.uuid4(), driver_id=emp1.id, vehicle_id=v1.id,
            pickup_lat=18.5362, pickup_lng=73.8973, pickup_address="Koregaon Park, Pune",
            destination_lat=18.5912, destination_lng=73.7388, destination_address="Hinjewadi Phase 1, Pune",
            distance_km=18.5, estimated_duration_min=35,
            travel_date=tomorrow, travel_time=time(8, 30),
            total_seats=3, available_seats=2, fare_per_seat=45.0, status="active"
        )
        t1 = Trip(id=uuid.uuid4(), ride_id=r1.id, status="booked")
        
        # Booking for Ride 1
        b1 = Booking(id=uuid.uuid4(), ride_id=r1.id, passenger_id=emp2.id, seats_booked=1, total_fare=45.0, status="confirmed")
        
        # Ride 2: Completed
        r2 = Ride(
            id=uuid.uuid4(), driver_id=emp4.id, vehicle_id=v3.id,
            pickup_lat=18.5590, pickup_lng=73.7868, pickup_address="Baner, Pune",
            destination_lat=18.5679, destination_lng=73.9143, destination_address="Viman Nagar, Pune",
            distance_km=15.2, estimated_duration_min=40,
            travel_date=today, travel_time=time(9, 0),
            total_seats=3, available_seats=2, fare_per_seat=50.0, status="completed"
        )
        t2 = Trip(id=uuid.uuid4(), ride_id=r2.id, status="payment_completed", started_at=datetime.utcnow() - timedelta(hours=2), completed_at=datetime.utcnow() - timedelta(hours=1))
        
        # Booking for Ride 2
        b2 = Booking(id=uuid.uuid4(), ride_id=r2.id, passenger_id=emp5.id, seats_booked=1, total_fare=50.0, status="completed")
        
        db.add_all([r1, t1, b1, r2, t2, b2])
        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
