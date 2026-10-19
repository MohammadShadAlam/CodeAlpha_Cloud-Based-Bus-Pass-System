
import { getUserBookings, cancelBookingApi } from '../api';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Printer,
  Ticket,
  XCircle,
} from 'lucide-react';
import {
  BookingHistory,
  BookingSummary,
  Modal,
} from '../components/Common';
import { useBooking } from '../hooks/useBooking';
import { downloadBooking, printBooking } from '../utils/booking';
import type { Booking } from '../types';

type ApiBooking = {
  booking_id: number;
  user_id: number;
  bus_id: number;
  operator_name: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  seats_booked: number;
  booking_status: string;
  fare_per_seat: number;
  total_fare: number;
};

export function ConfirmationPage() {
  const { reference } = useParams();
  const { bookings, notice } = useBooking();
  const booking = bookings.find((item) => item.reference === reference);

  if (!booking) {
    return (
      <div className="page-wrap empty-state">
        <Ticket size={42} />
        <h2>Booking not found</h2>
        <p>This demo booking may be stored in another browser.</p>
        <Link className="primary-btn" to="/bookings">
          View my bookings <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrap confirmation-page">
      <div className="confirmation-symbol">
        <CheckCircle2 size={38} />
      </div>
      <span className="eyebrow">YOU'RE ALL SET FOR THE DEMO</span>
      <h1>Your journey is on the map.</h1>
      <p className="confirmation-lead">
        Your sample booking is saved in this browser. This is not a real
        reservation or travel ticket.
      </p>

      <div className="confirmation-sheet">
        <div className="sheet-top">
          <span>DEMO BOOKING REFERENCE</span>
          <strong>{booking.reference}</strong>
        </div>

        <BookingSummary booking={booking} />

        <div className="sheet-actions">
          <button
            onClick={() => {
              downloadBooking(booking)
                .then(() => notice('Demo ticket saved as PDF.', 'success'))
                .catch(() =>
                  notice('Could not create the PDF. Please try again.', 'error')
                );
            }}
          >
            <Download size={17} /> Download PDF ticket
          </button>

          <button
            onClick={() => {
              printBooking(booking).then((ok) => {
                if (!ok) {
                  notice(
                    'Could not open the print dialog. Try Download PDF ticket instead.',
                    'error'
                  );
                }
              });
            }}
          >
            <Printer size={17} /> Print ticket
          </button>
        </div>
      </div>

      <div className="confirmation-links">
        <Link className="primary-btn" to="/bookings">
          View my bookings <ArrowRight size={18} />
        </Link>
        <Link className="outline-btn" to="/">
          Explore another route
        </Link>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { bookings, cancelBooking, notice } = useBooking();

  const [apiBookings, setApiBookings] = useState<ApiBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const [userId] = useState(() =>
    localStorage.getItem('tripzo-user-id')
  );

  useEffect(() => {
    let active = true;

    if (!userId || !Number.isFinite(Number(userId))) {
      setLoadingBookings(false);
      return;
    }

    getUserBookings(Number(userId))
      .then((data) => {
        if (active) {
          setApiBookings(data.bookings ?? []);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          notice(
            error instanceof Error
              ? error.message
              : 'Unable to load bookings.',
            'error'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoadingBookings(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const handleBackendCancel = async (bookingId: number) => {
    try {
      await cancelBookingApi(bookingId);

      setApiBookings((previous) =>
        previous.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, booking_status: 'cancelled' }
            : booking
        )
      );

      notice('Booking cancelled successfully.', 'success');
    } catch (error: unknown) {
      notice(
        error instanceof Error
          ? error.message
          : 'Unable to cancel booking.',
        'error'
      );
    }
  };

  const current =
    selected &&
    bookings.find((booking) => booking.reference === selected.reference);

  return (
    <div className="page-wrap inner-page">
      <div className="page-top">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} /> Back to map
        </Link>
        <span className="demo-badge">MY JOURNEYS</span>
      </div>

      <div className="inner-heading">
        <span className="eyebrow">YOUR JOURNEYS</span>
        <h1>My bookings.</h1>
        <p>View your bookings and manage your journeys in one place.</p>
      </div>

      <section>
        <h2>Online bookings</h2>

        {loadingBookings ? (
          <div className="empty-state">
            <p>Loading your bookings...</p>
          </div>
        ) : apiBookings.length > 0 ? (
          <div className="booking-history-list">
            {apiBookings.map((booking) => {
              const isCancelled =
                booking.booking_status.toLowerCase() === 'cancelled';

              return (
                <div className="booking-card" key={booking.booking_id}>
                  <div>
                    <h3>
                      {booking.source} <ArrowRight size={16} />{' '}
                      {booking.destination}
                    </h3>

                    <p>{booking.operator_name}</p>
                    <p>Booking ID: {booking.booking_id}</p>
                    <p>Departure: {booking.departure_time}</p>
                    <p>Arrival: {booking.arrival_time}</p>
                    <p>Seats booked: {booking.seats_booked}</p>
                    <p>
                      Fare per seat: ₹{booking.fare_per_seat}
                    </p>
                    <p>Total fare: ₹{booking.total_fare}</p>

                    <span
                      className={`status ${isCancelled ? 'cancelled' : ''}`}
                    >
                      {booking.booking_status}
                    </span>
                  </div>

                  {!isCancelled && (
                    <button
                      className="danger-btn"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to cancel this booking?'
                          )
                        ) {
                          void handleBackendCancel(booking.booking_id);
                        }
                      }}
                    >
                      <XCircle size={16} /> Cancel booking
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Ticket size={40} />
            <h2>No online bookings found.</h2>
            <p>Bookings made through your account will appear here.</p>
            <Link className="primary-btn" to="/">
              Find a bus <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2>Browser-saved demo bookings</h2>

        {bookings.length > 0 ? (
          <BookingHistory bookings={bookings} onOpen={setSelected} />
        ) : (
          <p>No browser-saved demo bookings.</p>
        )}
      </section>

      {current && (
        <Modal
          title="Booking details"
          onClose={() => {
            setSelected(null);
            setConfirmCancel(false);
          }}
        >
          <div className="modal-ref">
            <span>{current.reference}</span>
            <span
              className={`status ${
                current.status === 'Cancelled' ? 'cancelled' : ''
              }`}
            >
              {current.status}
            </span>
          </div>

          <BookingSummary booking={current} />

          <div className="modal-passengers">
            <h3>Passengers</h3>
            {current.passengers.map((passenger, index) => (
              <p key={index}>
                {passenger.name} · {passenger.age} yrs · Seat{' '}
                {current.seats[index]}
              </p>
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="outline-btn"
              onClick={() => downloadBooking(current)}
            >
              <Download size={16} /> Download
            </button>

            <button
              className="outline-btn"
              onClick={() => {
                if (!printBooking(current)) {
                  notice(
                    'Allow pop-ups to print your booking summary.',
                    'error'
                  );
                }
              }}
            >
              <Printer size={16} /> Print
            </button>

            {current.status !== 'Cancelled' && (
              <button
                className="danger-btn"
                onClick={() => setConfirmCancel(true)}
              >
                <XCircle size={16} /> Cancel booking
              </button>
            )}
          </div>

          {confirmCancel && (
            <div className="cancel-confirm">
              <strong>Cancel this demo booking?</strong>
              <p>This updates its status in this browser.</p>

              <div>
                <button onClick={() => setConfirmCancel(false)}>
                  Keep booking
                </button>
                <button
                  onClick={() => {
                    cancelBooking(current.reference);
                    setConfirmCancel(false);
                    notice('Demo booking cancelled.', 'success');
                  }}
                >
                  Yes, cancel booking
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
