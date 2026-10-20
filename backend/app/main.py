
import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models
from app.database import Base, engine, get_db
from app.models import Booking, Bus, User


# ---------- CONFIGURATION ----------

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from the .env file")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer()

app = FastAPI(
    title="Tripzo API",
    description="Backend API for the Tripzo bus booking platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://code-alpha-cloud-based-bus-pass-sys-xi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- AUTHENTICATION ----------

def get_current_user(
    credentials=Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    credentials_error = HTTPException(
        status_code=401,
        detail="Invalid or expired access token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id = int(payload.get("sub", ""))
    except (jwt.PyJWTError, ValueError, TypeError):
        raise credentials_error

    user = db.get(User, user_id)

    if not user:
        raise credentials_error

    return user


# ---------- HOME / HEALTH ----------

@app.get("/")
def home():
    return {
        "message": "Welcome to Tripzo API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# ---------- DATABASE SETUP ----------

@app.post("/setup-database")
def setup_database():
    Base.metadata.create_all(bind=engine)

    return {
        "message": "Tripzo database tables created successfully!"
    }


# ---------- BUSES ----------

@app.get("/buses")
def get_buses(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()

    return {
        "count": len(buses),
        "buses": [
            {
                "id": bus.id,
                "operator_name": bus.operator_name,
                "source": bus.source,
                "destination": bus.destination,
                "departure_time": bus.departure_time,
                "arrival_time": bus.arrival_time,
                "total_seats": bus.total_seats,
                "fare": bus.fare,
            }
            for bus in buses
        ],
    }


# ---------- REGISTRATION ----------

class UserRegistration(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=8, max_length=128)


@app.post("/register")
def register_user(
    request: UserRegistration,
    db: Session = Depends(get_db),
):
    user = User(
        full_name=request.full_name.strip(),
        email=str(request.email).lower(),
        phone=request.phone.strip(),
        hashed_password=password_hash.hash(request.password),
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This email or phone number is already registered.",
        )

    return {
        "message": "User registered successfully!",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
        },
    }


# ---------- LOGIN ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


@app.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).lower()

    user = db.query(User).filter(User.email == email).first()

    if (
        not user
        or not user.hashed_password
        or not password_hash.verify(
            request.password,
            user.hashed_password,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    access_token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
        },
    }


# ---------- USER PROFILE ----------

class ProfileUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    email: EmailStr | None = None
    phone: str | None = Field(
        default=None,
        min_length=10,
        max_length=20,
    )


@app.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
        }
    }


@app.patch("/me")
def update_my_profile(
    request: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    changes = request.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update.",
        )

    if "full_name" in changes and changes["full_name"] is not None:
        current_user.full_name = changes["full_name"].strip()

    if "email" in changes and changes["email"] is not None:
        current_user.email = str(changes["email"]).lower()

    if "phone" in changes and changes["phone"] is not None:
        current_user.phone = changes["phone"].strip()

    try:
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This email or phone number is already in use.",
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Profile update failed.",
        )

    return {
        "message": "Profile updated successfully.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
        },
    }


# ---------- SAVED PASSENGERS ----------

class SavedPassengerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    age: int = Field(gt=0, le=120)
    gender: str = Field(min_length=1, max_length=30)


@app.get("/saved-passengers")
def get_saved_passengers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    passengers = (
        db.query(models.SavedPassenger)
        .filter(
            models.SavedPassenger.user_id == current_user.id
        )
        .order_by(models.SavedPassenger.id.desc())
        .all()
    )

    return {
        "count": len(passengers),
        "passengers": [
            {
                "id": passenger.id,
                "name": passenger.name,
                "age": passenger.age,
                "gender": passenger.gender,
            }
            for passenger in passengers
        ],
    }


@app.post("/saved-passengers", status_code=201)
def add_saved_passenger(
    request: SavedPassengerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    passenger = models.SavedPassenger(
        user_id=current_user.id,
        name=request.name.strip(),
        age=request.age,
        gender=request.gender.strip(),
    )

    try:
        db.add(passenger)
        db.commit()
        db.refresh(passenger)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Saved passenger could not be added.",
        )

    return {
        "message": "Passenger saved successfully!",
        "passenger": {
            "id": passenger.id,
            "name": passenger.name,
            "age": passenger.age,
            "gender": passenger.gender,
        },
    }


@app.delete("/saved-passengers/{passenger_id}")
def delete_saved_passenger(
    passenger_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    passenger = (
        db.query(models.SavedPassenger)
        .filter(
            models.SavedPassenger.id == passenger_id,
            models.SavedPassenger.user_id == current_user.id,
        )
        .first()
    )

    if not passenger:
        raise HTTPException(
            status_code=404,
            detail="Saved passenger not found.",
        )

    try:
        db.delete(passenger)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Saved passenger could not be deleted.",
        )

    return {"message": "Saved passenger deleted successfully!"}


# ---------- CREATE BOOKING ----------

class BookingRequest(BaseModel):
    bus_id: int = Field(gt=0)
    seats_booked: int = Field(gt=0, le=10)


@app.post("/bookings")
def create_booking(
    request: BookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Lock the bus row while checking seat availability.
        bus = db.execute(
            select(Bus)
            .where(Bus.id == request.bus_id)
            .with_for_update()
        ).scalar_one_or_none()

        if not bus:
            raise HTTPException(
                status_code=404,
                detail="Bus not found.",
            )

        booked_seats = (
            db.query(func.sum(Booking.seats_booked))
            .filter(
                Booking.bus_id == bus.id,
                Booking.booking_status == "confirmed",
            )
            .scalar()
            or 0
        )

        available_seats = bus.total_seats - booked_seats

        if request.seats_booked > available_seats:
            raise HTTPException(
                status_code=400,
                detail=f"Only {available_seats} seats are available.",
            )

        booking = Booking(
            user_id=current_user.id,
            bus_id=bus.id,
            seats_booked=request.seats_booked,
            booking_status="confirmed",
        )

        db.add(booking)
        db.commit()
        db.refresh(booking)

        return {
            "message": "Booking created successfully!",
            "booking_id": booking.id,
            "user_id": booking.user_id,
            "bus_id": booking.bus_id,
            "seats_booked": booking.seats_booked,
            "booking_status": booking.booking_status,
            "available_seats": available_seats - request.seats_booked,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Booking could not be saved.",
        )


# ---------- GET USER BOOKINGS ----------

@app.get("/bookings/{user_id}")
def get_user_bookings(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # A user can access only their own bookings.
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access another user's bookings.",
        )

    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.id.desc())
        .all()
    )

    result = []

    for booking in bookings:
        bus = db.get(Bus, booking.bus_id)

        result.append({
            "booking_id": booking.id,
            "user_id": booking.user_id,
            "bus_id": booking.bus_id,
            "operator_name": bus.operator_name if bus else None,
            "source": bus.source if bus else None,
            "destination": bus.destination if bus else None,
            "departure_time": bus.departure_time if bus else None,
            "arrival_time": bus.arrival_time if bus else None,
            "seats_booked": booking.seats_booked,
            "booking_status": booking.booking_status,
            "fare_per_seat": bus.fare if bus else None,
            "total_fare": (
                bus.fare * booking.seats_booked if bus else None
            ),
        })

    return {
        "user_id": current_user.id,
        "count": len(result),
        "bookings": result,
    }


# ---------- CANCEL BOOKING ----------

@app.patch("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    if booking.booking_status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="This booking is already cancelled.",
        )

    try:
        booking.booking_status = "cancelled"
        db.commit()
        db.refresh(booking)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Booking cancellation failed.",
        )

    return {
        "message": "Booking cancelled successfully!",
        "booking_id": booking.id,
        "booking_status": booking.booking_status,
    }
