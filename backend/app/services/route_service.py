"""OSRM route calculation service (free, no API key)."""

import httpx
from typing import Optional, List
from app.config import settings


async def calculate_route(
    pickup_lat: float, pickup_lng: float,
    dest_lat: float, dest_lng: float,
) -> dict:
    """Calculate driving route using OSRM."""
    url = (
        f"{settings.OSRM_BASE_URL}/route/v1/driving/"
        f"{pickup_lng},{pickup_lat};{dest_lng},{dest_lat}"
        f"?overview=full&geometries=geojson"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError("Could not calculate route")

    route = data["routes"][0]

    # OSRM returns [lng, lat] — flip to [lat, lng] for frontend
    coordinates = route["geometry"]["coordinates"]
    polyline = [[coord[1], coord[0]] for coord in coordinates]

    return {
        "distance_km": round(route["distance"] / 1000, 2),
        "duration_min": round(route["duration"] / 60),
        "polyline": polyline,
    }


async def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    """Get address from coordinates using Nominatim (free)."""
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers={"User-Agent": "CarpoolingPlatform/1.0"})
            data = response.json()
            return data.get("display_name")
    except Exception:
        return None
