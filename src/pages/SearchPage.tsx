import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  CalendarDays,
  ChevronDown,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { getBuses } from '../api';
import type { ApiBus } from '../api';
import type { Bus } from '../types';
import { BusCard, BusFilters } from '../components/BusComponents';
import { DateSelector, PassengerSelector } from '../components/BookingControls';
import { useBooking } from '../hooks/useBooking';

function convertApiBus(bus: ApiBus): Bus {
  const departureHour = Number(bus.departure_time.slice(0, 2));
  const arrivalHour = Number(bus.arrival_time.slice(0, 2));

  const durationHours =
    (arrivalHour - departureHour + 24) % 24 || 24;

  return {
    id: String(bus.id),
    operator: bus.operator_name,
    service: `${bus.source} - ${bus.destination}`,
    type: 'AC Sleeper',
    departure: bus.departure_time,
    arrival: bus.arrival_time,
    duration: `${durationHours}h`,
    hours: durationHours,
    fare: bus.fare,
    seats: bus.total_seats,
    rating: 0,
    boarding: bus.source,
    dropping: bus.destination,
    amenities: [],
  };
}

export default function SearchPage() {
  const {
    pickup,
    drop,
    date,
    setDate,
    count,
    setCount,
    notice,
  } = useBooking();

  const navigate = useNavigate();

  const [apiBuses, setApiBuses] = useState<Bus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(true);
  const [busError, setBusError] = useState('');

  const [type, setType] = useState('All buses');
  const [window, setWindow] = useState('Any time');
  const [maxPrice, setMaxPrice] = useState(1600);
  const [sort, setSort] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isActive = true;

    getBuses()
      .then((data) => {
        if (!isActive) return;

        setApiBuses(data.map(convertApiBus));
        setBusError('');
      })
      .catch((error: unknown) => {
        if (!isActive) return;

        setBusError(
          error instanceof Error
            ? error.message
            : 'Unable to load buses from the server.'
        );
      })
      .finally(() => {
        if (isActive) {
          setLoadingBuses(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return apiBuses
      .filter(
        (bus) =>
          (type === 'All buses' || bus.type === type) &&
          bus.fare <= maxPrice &&
          (window === 'Any time' ||
            (window.startsWith('Morning') &&
              Number(bus.departure.slice(0, 2)) < 12) ||
            (window.startsWith('Afternoon') &&
              Number(bus.departure.slice(0, 2)) >= 12 &&
              Number(bus.departure.slice(0, 2)) < 18) ||
            (window.startsWith('Evening') &&
              Number(bus.departure.slice(0, 2)) >= 18))
      )
      .sort((a, b) =>
        sort === 'Price: low to high'
          ? a.fare - b.fare
          : sort === 'Earliest departure'
            ? a.departure.localeCompare(b.departure)
            : sort === 'Shortest duration'
              ? a.hours - b.hours
              : b.rating - a.rating
      );
  }, [apiBuses, type, window, maxPrice, sort]);

  const reset = () => {
    setType('All buses');
    setWindow('Any time');
    setMaxPrice(1600);
  };

  return (
    <div className="page-wrap search-page">
      <div className="page-top">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} /> Back to map
        </Link>
        <span className="demo-badge">LIVE DATABASE DATA</span>
      </div>

      <div className="search-title">
        <div>
          <span className="eyebrow">YOUR NEXT JOURNEY</span>
          <h1>
            {pickup?.city || 'Choose pickup'}{' '}
            <span className="title-arrow">→</span>{' '}
            {drop?.city || 'Choose destination'}
          </h1>
          <p>
            Bus listings are loaded from the Tripzo backend.
            Confirm route details and availability before booking.
          </p>
        </div>
        <Link className="outline-btn" to="/">
          <MapPin size={17} /> Edit route
        </Link>
      </div>

      <div className="search-toolbar">
        <DateSelector date={date} onChange={setDate} />
        <PassengerSelector count={count} onChange={setCount} />
        <button
          className="filter-mobile-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} /> Filters <ChevronDown size={15} />
        </button>
      </div>

      <div className="results-layout">
        <div className={`filter-container ${showFilters ? 'show' : ''}`}>
          <BusFilters
            {...{
              type,
              setType,
              window,
              setWindow,
              maxPrice,
              setMaxPrice,
              onReset: reset,
            }}
          />
        </div>

        <div className="results-content">
          <div className="results-heading">
            <div>
              <h2>
                {loadingBuses ? 'Loading buses...' : `${filtered.length} buses found`}{' '}
                {!loadingBuses && <span>for your journey</span>}
              </h2>
              <p>
                <CalendarDays size={15} />
                {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                · {count} {count === 1 ? 'passenger' : 'passengers'}
              </p>
            </div>

            <label className="sort-select">
              Sort by{' '}
              <select
                aria-label="Sort buses"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option>Recommended</option>
                <option>Price: low to high</option>
                <option>Earliest departure</option>
                <option>Shortest duration</option>
              </select>
            </label>
          </div>

          {loadingBuses ? (
            <div className="empty-state">
              <BusFront size={36} />
              <h3>Loading available buses</h3>
              <p>Please wait while we fetch buses from the server.</p>
            </div>
          ) : busError ? (
            <div className="empty-state">
              <BusFront size={36} />
              <h3>Unable to load buses</h3>
              <p>{busError}</p>
              <button
                className="primary-btn"
                onClick={() => globalThis.location.reload()}
              >
                Try again <ArrowRight size={17} />
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="bus-list">
              {filtered.map((bus) => (
                <BusCard
                  bus={bus}
                  key={bus.id}
                  onSelect={() => {
                    if (!pickup || !drop) {
                      notice(
                        'Set your pickup and destination on the map first.',
                        'error'
                      );
                      navigate('/');
                      return;
                    }

                    if (!date) {
                      notice('Select a travel date first.', 'error');
                      return;
                    }

                    navigate(`/book/${bus.id}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BusFront size={36} />
              <h3>No buses match these filters</h3>
              <p>
                Try adjusting your bus type, departure time or budget.
              </p>
              <button className="primary-btn" onClick={reset}>
                Reset filters <ArrowRight size={17} />
              </button>
            </div>
          )}

          <p className="results-disclaimer">
            Bus schedules, fares and seat counts are provided by the
            backend. Confirm actual availability before completing a booking.
          </p>
        </div>
      </div>
    </div>
  );
}