"""
Models package for the Enterprise Carpooling Platform.

Imports all SQLAlchemy models so they are registered with the Base metadata
when this package is imported.
"""

from app.models.organization import Organization
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.ride import Ride
from app.models.booking import Booking
from app.models.trip import Trip
from app.models.payment import Payment
from app.models.wallet import Wallet, WalletTransaction
from app.models.chat import ChatMessage
