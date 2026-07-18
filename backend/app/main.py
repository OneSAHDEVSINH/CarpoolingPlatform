"""FastAPI application entry point with CORS, router registration, and startup events."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

# Import all models so they are registered with Base.metadata
from app.models import (  # noqa: F401
    organization, user, vehicle, ride, booking, trip, payment, wallet, chat
)

# Import routers
from app.routers import auth, vehicles, rides, bookings, trips, payments, wallet, reports, admin, websocket_rt

app = FastAPI(
    title="Enterprise Carpooling Platform",
    description="Backend API for the Carpooling Platform — Hackathon 2026",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Create all tables on startup (dev convenience — use Alembic in production)."""
    Base.metadata.create_all(bind=engine)


@app.get("/", tags=["Health"])
async def root():
    return {"message": "Carpooling Platform API is running", "docs": "/docs"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# ── Register Routers ────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(rides.router, prefix="/api/rides", tags=["Rides"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(websocket_rt.router, tags=["WebSocket"])
