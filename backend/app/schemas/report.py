"""
Reporting and analytics Pydantic v2 schemas.

Covers monthly aggregation data, cost breakdowns, fuel trends,
and the top-level report summary.
"""

from pydantic import BaseModel
from typing import List


class MonthlyData(BaseModel):
    """Trip count for a single month."""

    month: str
    count: int = 0


class CostData(BaseModel):
    """Cost metric for a single month."""

    month: str
    cost: float


class VehicleCost(BaseModel):
    """Aggregate cost attributed to a specific vehicle."""

    vehicle: str
    cost: float


class FuelTrend(BaseModel):
    """Fuel efficiency trend for a single month."""

    month: str
    efficiency: float


class ReportSummary(BaseModel):
    """Top-level analytics report returned by the API."""

    total_trips: int
    total_distance: float
    fuel_saved: float
    money_saved: float
    monthly_trips: List[dict]
    cost_per_km: List[dict]
    vehicle_costs: List[dict]
    fuel_trends: List[dict]
