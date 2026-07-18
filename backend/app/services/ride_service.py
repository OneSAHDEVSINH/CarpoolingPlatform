"""Ride matching and search logic."""

from sqlalchemy.orm import Session
from app.models.ride import Ride
from app.models.user import User
from app.models.vehicle import Vehicle
from app.utils.geo import haversine_distance, is_within_radius
from datetime import date
from typing import List


def search_matching_rides(
    db: Session,
    pickup_lat: float,
    pickup_lng: float,
    dest_lat: float,
    dest_lng: float,
    travel_date: date,
    seats_needed: int = 1,
    radius_km: float = 5.0,
) -> List[dict]:
    """Find active rides matching location and date criteria."""
    rides = (
        db.query(Ride)
        .filter(
            Ride.status == "active",
            Ride.travel_date == travel_date,
            Ride.available_seats >= seats_needed,
        )
        .all()
    )

    matching = []
    for ride in rides:
        pickup_match = is_within_radius(
            pickup_lat, pickup_lng,
            ride.pickup_lat, ride.pickup_lng,
            radius_km,
        )
        dest_match = is_within_radius(
            dest_lat, dest_lng,
            ride.destination_lat, ride.destination_lng,
            radius_km,
        )

        if pickup_match and dest_match:
            driver = db.query(User).filter(User.id == ride.driver_id).first()
            vehicle = db.query(Vehicle).filter(Vehicle.id == ride.vehicle_id).first()
            pickup_dist = haversine_distance(pickup_lat, pickup_lng, ride.pickup_lat, ride.pickup_lng)
            matching.append({
                "ride": ride,
                "driver": driver,
                "vehicle": vehicle,
                "pickup_distance_km": round(pickup_dist, 2),
            })

    # Sort by pickup proximity
    matching.sort(key=lambda x: x["pickup_distance_km"])
    return matching
