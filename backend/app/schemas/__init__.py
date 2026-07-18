"""
Pydantic v2 schemas for the Enterprise Carpooling Platform.

This package contains all request/response schemas organized by domain:
- user: Authentication, profile, and token schemas
- vehicle: Vehicle CRUD schemas
- ride: Ride creation, search, and response schemas
- trip: Trip tracking, chat, and location schemas
- payment: Payment processing and wallet schemas
- report: Analytics and reporting schemas
"""

from app.schemas.user import (
    SavedPlace,
    UserRegister,
    UserLogin,
    UserProfile,
    UserProfileUpdate,
    TokenResponse,
)
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.schemas.ride import (
    LocationPoint,
    RouteRequest,
    RouteResponse,
    RideCreate,
    RideSearch,
    DriverInfo,
    VehicleBrief,
    RideResponse,
)
from app.schemas.trip import (
    PassengerInfo,
    TripResponse,
    LocationUpdate,
    ChatMessageCreate,
    ChatMessageResponse,
)
from app.schemas.payment import (
    PaymentCreate,
    PaymentVerify,
    PaymentResponse,
    WalletResponse,
    WalletRecharge,
    WalletPay,
    WalletTransactionResponse,
)
from app.schemas.report import (
    MonthlyData,
    CostData,
    VehicleCost,
    FuelTrend,
    ReportSummary,
)
