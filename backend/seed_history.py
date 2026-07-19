import random
import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.ride import Ride
from app.models.trip import Trip
from app.models.booking import Booking

db = SessionLocal()

def generate_random_date(days_back=180):
    start = datetime.utcnow() - timedelta(days=days_back)
    random_days = random.randint(0, days_back)
    return start + timedelta(days=random_days, hours=random.randint(6, 20), minutes=random.randint(0, 59))

users = db.query(User).all()
if not users:
    print("No users found. Please create users first.")
    exit()

LOCATIONS = [
    {"lat": 19.0760, "lng": 72.8777, "addr": "Bandra Kurla Complex, Mumbai"},
    {"lat": 19.0178, "lng": 72.8478, "addr": "Dadar TT Circle, Mumbai"},
    {"lat": 19.1136, "lng": 72.8697, "addr": "Andheri East, Mumbai"},
    {"lat": 19.2183, "lng": 72.9781, "addr": "Thane West, Thane"},
    {"lat": 18.5204, "lng": 73.8567, "addr": "Shivaji Nagar, Pune"},
    {"lat": 18.5913, "lng": 73.7389, "addr": "Hinjewadi IT Park, Pune"},
    {"lat": 28.7041, "lng": 77.1025, "addr": "Connaught Place, New Delhi"},
    {"lat": 28.4595, "lng": 77.0266, "addr": "Cyber Hub, Gurugram"},
]

def seed_history():
    print("Seeding past rides and bookings...")
    
    # Pre-fetch or create a vehicle for every user to be a driver
    user_vehicles = {}
    for u in users:
        v = db.query(Vehicle).filter(Vehicle.owner_id == u.id).first()
        if not v:
            v = Vehicle(
                id=uuid.uuid4(),
                owner_id=u.id,
                model=random.choice(["Honda City", "Hyundai Creta", "Maruti Swift", "Tata Nexon"]),
                registration_number=f"MH-0{random.randint(1,9)}-{random.randint(1000,9999)}",
                seating_capacity=4,
                fuel_type="Petrol"
            )
            db.add(v)
            db.flush()
        user_vehicles[u.id] = v.id

    for user in users:
        # Create 3-7 completed driver rides
        num_driver_rides = random.randint(3, 7)
        for _ in range(num_driver_rides):
            dt = generate_random_date()
            p = random.choice(LOCATIONS)
            d = random.choice([loc for loc in LOCATIONS if loc != p])
            dist = random.uniform(5.0, 35.0)
            
            ride = Ride(
                id=uuid.uuid4(),
                driver_id=user.id,
                vehicle_id=user_vehicles[user.id],
                pickup_lat=p["lat"], pickup_lng=p["lng"], pickup_address=p["addr"],
                destination_lat=d["lat"], destination_lng=d["lng"], destination_address=d["addr"],
                distance_km=dist,
                estimated_duration_min=int(dist * 2.5),
                travel_date=dt.date(),
                travel_time=dt.time(),
                total_seats=4,
                available_seats=random.randint(0, 3),
                fare_per_seat=round(dist * 5.0, 0),
                status="completed",
                created_at=dt - timedelta(days=2)
            )
            db.add(ride)
            
            trip = Trip(
                id=uuid.uuid4(),
                ride_id=ride.id,
                status="completed",
                started_at=dt,
                completed_at=dt + timedelta(minutes=int(dist * 2.5)),
                created_at=dt - timedelta(days=2)
            )
            db.add(trip)
            db.flush()
            
            # Maybe add a random passenger booking to this ride?
            other_users = [u for u in users if u.id != user.id]
            if other_users and random.choice([True, False]):
                passenger = random.choice(other_users)
                b = Booking(
                    id=uuid.uuid4(),
                    ride_id=ride.id,
                    passenger_id=passenger.id,
                    seats_booked=1,
                    total_fare=ride.fare_per_seat,
                    status="completed",
                    booked_at=dt - timedelta(days=1)
                )
                db.add(b)
                
    db.commit()
    print("Seeding complete! Random historical data generated.")

if __name__ == "__main__":
    seed_history()
