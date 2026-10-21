
from datetime import date

from sqlalchemy import (
    String,
    Integer,
    Boolean,
    ForeignKey,
    Date,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )
    phone: Mapped[str] = mapped_column(
        String(20), unique=True
    )
    hashed_password: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )


class Bus(Base):
    __tablename__ = "buses"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    operator_name: Mapped[str] = mapped_column(String(150))
    source: Mapped[str] = mapped_column(String(100))
    destination: Mapped[str] = mapped_column(String(100))
    departure_time: Mapped[str] = mapped_column(String(30))
    arrival_time: Mapped[str] = mapped_column(String(30))
    total_seats: Mapped[int] = mapped_column(Integer)
    fare: Mapped[int] = mapped_column(Integer)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )
    bus_id: Mapped[int] = mapped_column(
        ForeignKey("buses.id")
    )
    seats_booked: Mapped[int] = mapped_column(Integer)

    # Nullable to preserve legacy bookings with unknown dates.
    journey_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    booking_status: Mapped[str] = mapped_column(
        String(30), default="confirmed"
    )


class BookingSeat(Base):
    __tablename__ = "booking_seats"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
    )
    bus_id: Mapped[int] = mapped_column(
        ForeignKey("buses.id"), nullable=False
    )
    journey_date: Mapped[date] = mapped_column(
        Date, nullable=False
    )
    seat_number: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )


class SavedPassenger(Base):
    __tablename__ = "saved_passengers"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    age: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    gender: Mapped[str] = mapped_column(
        String(30), nullable=False
    )
