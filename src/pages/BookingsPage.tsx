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
  journey_date?: string;
  date?: string;
  seat_numbers?: (number | string)[];
};

function getStoredUserId(): number | null {
  try {
    const storedUser = localStorage.getItem('tripzo-user');
    if (!storedUser) return null;

    const parsed = JSON.parse(storedUser);
    const rawId =
      parsed?.id ??
      parsed?.user_id ??
      parsed?.user?.id ??
      parsed?.user?.user_id;

    const id = Number(rawId);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function apiBookingToTicket(booking: ApiBooking): Booking {
  const isCancelled =
    booking.booking_status.toLowerCase() === 'cancelled';

  const makeLocation = (
    id: string,
    name: string
  ): Booking['pickup'] => ({
    id,
    name,
    city: name,
    district: '',
    state: '',
    type: 'city',
    lat: 0,
    lng: 0,
  });

  const bus: Booking['bus'] = {
    id: String(booking.bus_id),
    operator: booking.operator_name,
    service: booking.operator_name,
    type: 'AC Seater',
    departure: booking.departure_time,
    arrival: booking.arrival_time,
    duration: '',
    hours: 0,
    fare: booking.fare_per_seat,
    seats: booking.seats_booked,
    rating: 0,
    boarding: booking.source,
    dropping: booking.destination,
    amenities: [],
  };

  const rawDate = booking.journey_date ?? booking.date ?? '';
  const date = rawDate ? rawDate.slice(0, 10) : '';

  const seats = (booking.seat_numbers ?? [])
    .map(Number)
    .filter((seat) => Number.isSafeInteger(seat) && seat > 0);

  return {
    reference: `TZ${booking.booking_id}`,
    bus,
    pickup: makeLocation('pickup', booking.source),
    drop: makeLocation('drop', booking.destination),
    date,
    seats,
    passengers: [],
    email: '',
    phone: '',
    total: booking.total_fare,
    discount: 0,
    status: isCancelled ? 'Cancelled' : 'Confirmed',
    createdAt: '',
  };
}

export function ConfirmationPage() {
  const { reference } = useParams();
  const { bookings, notice } = useBooking();

  const booking = bookings.find(
    (item) => item.reference === reference
  );

  if (!booking) {
    return (
      <div className="page-wrap empty-state">
        <Ticket size={42} />
        <h2>Booking not found</h2>
        <p>This booking may be stored in another browser.</p>
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

      <span className="eyebrow">BOOKING DETAILS</span>
      <h1>Your journey is on the map.</h1>
      <p className="confirmation-lead">
        Your booking details are shown below. Keep your reference handy.
      </p>

      <div className="confirmation-sheet">
        <div className="sheet-top">
          <span>BOOKING REFERENCE</span>
          <strong>{booking.reference}</strong>
        </div>

        <BookingSummary booking={booking} />

        <div className="sheet-actions">
          <button
            onClick={() => {
              downloadBooking(booking)
                .then(() => notice('Ticket saved as PDF.', 'success'))
                .catch(() =>
                  notice(
                    'Could not create the PDF. Please try again.',
                    'error'
                  )
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
                    'Could not open the print dialog. Try downloading the PDF.',
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
  const { notice } = useBooking();

  const [apiBookings, setApiBookings] = useState<ApiBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedOnlineId, setSelectedOnlineId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(
    () => getStoredUserId()
  );

  useEffect(() => {
    setUserId(getStoredUserId());
  }, []);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setApiBookings([]);
      setLoadError('Please sign in to view your online bookings.');
      setLoadingBookings(false);

      return () => {
        active = false;
      };
    }

    setLoadingBookings(true);
    setLoadError('');

    getUserBookings(userId)
      .then((data) => {
        if (active) setApiBookings(data.bookings ?? []);
      })
      .catch((error: unknown) => {
        console.error('Unable to load online bookings:', error);

        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load bookings. Please try again.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingBookings(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const reloadBookings = async () => {
    const currentUserId = getStoredUserId();

    if (!currentUserId) {
      setApiBookings([]);
      setLoadError('Please sign in to view your online bookings.');
      setLoadingBookings(false);
      return;
    }

    setUserId(currentUserId);
    setLoadingBookings(true);
    setLoadError('');

    try {
      const data = await getUserBookings(currentUserId);
      setApiBookings(data.bookings ?? []);
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load bookings. Please try again.'
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBackendCancel = async (bookingId: number) => {
    if (cancellingId !== null) return;

    setCancellingId(bookingId);

    try {
      await cancelBookingApi(bookingId);

      setApiBookings((previous) =>
        previous.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, booking_status: 'cancelled' }
            : booking
        )
      );

      setSelectedOnlineId(null);
      notice('Booking cancelled successfully.', 'success');
    } catch (error: unknown) {
      console.error('Cancellation API failed:', error);

      notice(
        error instanceof Error
          ? error.message
          : 'Unable to cancel booking. Please try again.',
        'error'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const selectedOnline =
    selectedOnlineId === null
      ? null
      : apiBookings.find(
          (booking) => booking.booking_id === selectedOnlineId
        ) ?? null;

  const selectedOnlineTicket = selectedOnline
    ? apiBookingToTicket(selectedOnline)
    : null;

  const handleOnlinePrint = async () => {
    if (!selectedOnlineTicket) return;

    try {
      const ok = await printBooking(selectedOnlineTicket);

      if (!ok) {
        notice(
          'Could not open the print dialog. Allow pop-ups and try again.',
          'error'
        );
      }
    } catch {
      notice('Could not print this ticket. Please try again.', 'error');
    }
  };

  const handleOnlineDownload = async () => {
    if (!selectedOnlineTicket) return;

    try {
      await downloadBooking(selectedOnlineTicket);
      notice('Ticket download started.', 'success');
    } catch {
      notice(
        'Could not create the PDF. Please try again.',
        'error'
      );
    }
  };

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

      <section className="online-bookings-section">
        <div className="online-bookings-heading">
          <div>
            <h2 className="online-bookings-title">Online bookings</h2>
            <p className="online-bookings-subtitle">
              Your bookings linked to your account.
            </p>
          </div>

          <button
            type="button"
            className="outline-btn online-refresh-btn"
            onClick={() => void reloadBookings()}
            disabled={loadingBookings}
          >
            {loadingBookings ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingBookings ? (
          <div className="empty-state">
            <Ticket size={35} />
            <h2>Loading your bookings...</h2>
            <p>Please wait while we retrieve your booking history.</p>
          </div>
        ) : loadError ? (
          <div className="empty-state online-bookings-error">
            <Ticket size={35} />
            <h2>Unable to show bookings</h2>
            <p>{loadError}</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => void reloadBookings()}
            >
              Try again <ArrowRight size={17} />
            </button>
          </div>
        ) : apiBookings.length > 0 ? (
          <div className="history-list online-history-list">
            {apiBookings.map((booking) => {
              const cancelled =
                booking.booking_status.toLowerCase() === 'cancelled';

              const date = booking.journey_date ?? booking.date;

              return (
                <button
                  type="button"
                  className="history-item online-history-item"
                  key={booking.booking_id}
                  onClick={() => setSelectedOnlineId(booking.booking_id)}
                >
                  <div className="history-top">
                    <span className="ref">TZ{booking.booking_id}</span>
                    <span className={`status ${cancelled ? 'cancelled' : ''}`}>
                      {cancelled ? 'Cancelled' : 'Confirmed'}
                    </span>
                  </div>

                  <div className="history-route">
                    <strong>
                      {booking.source} <span>→</span> {booking.destination}
                    </strong>
                    <span>
                      ₹{booking.total_fare.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p>
                    {date
                      ? new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )
                      : 'Journey date unavailable'}
                    {' · '}
                    {booking.operator_name}
                    {' · '}
                    {booking.seats_booked}{' '}
                    {booking.seats_booked === 1 ? 'seat' : 'seats'}
                  </p>
                </button>
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

      {selectedOnline && selectedOnlineTicket && (
        <Modal
          title="Online booking details"
          onClose={() => setSelectedOnlineId(null)}
        >
          <div className="modal-ref">
            <span>{selectedOnlineTicket.reference}</span>
            <span
              className={`status ${
                selectedOnlineTicket.status === 'Cancelled'
                  ? 'cancelled'
                  : ''
              }`}
            >
              {selectedOnlineTicket.status}
            </span>
          </div>

          <div className="booking-summary">
            <div className="summary-route">
              <div>
                <small>FROM</small>
                <strong>{selectedOnline.source}</strong>
                <span>Departure · {selectedOnline.departure_time}</span>
              </div>

              <div className="summary-arrow">→</div>

              <div>
                <small>TO</small>
                <strong>{selectedOnline.destination}</strong>
                <span>Arrival · {selectedOnline.arrival_time}</span>
              </div>
            </div>

            <div className="summary-data">
              <div>
                <small>BUS</small>
                <strong>{selectedOnline.operator_name}</strong>
              </div>
              <div>
                <small>SEATS</small>
                <strong>{selectedOnline.seats_booked}</strong>
              </div>
              <div>
                <small>FARE PER SEAT</small>
                <strong>
                  ₹{selectedOnline.fare_per_seat.toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <small>TOTAL</small>
                <strong>
                  ₹{selectedOnline.total_fare.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="outline-btn"
              onClick={() => void handleOnlineDownload()}
            >
              <Download size={16} /> Download PDF
            </button>

            <button
              type="button"
              className="outline-btn"
              onClick={() => void handleOnlinePrint()}
            >
              <Printer size={16} /> Print ticket
            </button>

            {selectedOnline.booking_status.toLowerCase() !== 'cancelled' && (
              <button
                type="button"
                className="danger-btn"
                disabled={cancellingId === selectedOnline.booking_id}
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to cancel this online booking?'
                    )
                  ) {
                    void handleBackendCancel(selectedOnline.booking_id);
                  }
                }}
              >
                <XCircle size={16} />
                {cancellingId === selectedOnline.booking_id
                  ? 'Cancelling...'
                  : 'Cancel booking'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}