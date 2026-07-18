"""
User-related Pydantic v2 schemas.

Covers registration, authentication, profile management, and token responses.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class SavedPlace(BaseModel):
    """A user-saved location (home, office, etc.)."""

    label: str
    lat: float
    lng: float
    address: str


class UserRegister(BaseModel):
    """Schema for new user registration."""

    name: str
    email: EmailStr
    phone: str
    password: str
    org_id: Optional[str] = None
    org_name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login credentials."""

    email: EmailStr
    password: str


class UserProfile(BaseModel):
    """Public-facing user profile returned by the API."""

    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    org_id: str
    avatar_url: Optional[str] = None
    saved_places: Optional[List[SavedPlace]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """Schema for partial profile updates."""

    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    saved_places: Optional[List[SavedPlace]] = None


class TokenResponse(BaseModel):
    """Response returned after successful authentication."""

    token: str
    user: UserProfile
