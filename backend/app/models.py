
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    booking_status: Mapped[str] = mapped_column(
        String(30), default="confirmed"
    )


class SavedPassenger(Base):
    __tablename__ = "saved_passengers"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=False
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(30), nullable=False)
