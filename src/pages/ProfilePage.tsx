
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookUser,
  Check,
  Plus,
  Settings2,
  Ticket,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import { useProfile, type Preferences } from '../hooks/useProfile';
import { BookingHistory } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import {
  getMyProfile,
  updateMyProfile,
  getSavedPassengers,
  addSavedPassenger as addSavedPassengerApi,
  deleteSavedPassenger,
  type ApiSavedPassenger,
} from '../api';

type Tab = 'details' | 'passengers' | 'history' | 'preferences';

const tabs: { id: Tab; label: string; icon: typeof UserRound }[] = [
  { id: 'details', label: 'Personal details', icon: UserRound },
  { id: 'passengers', label: 'Saved passengers', icon: BookUser },
  { id: 'history', label: 'Booking history', icon: Ticket },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
];

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="pref-toggle">
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

export default function ProfilePage() {
  const { bookings, notice } = useBooking();
  const { profile, save, reset } = useProfile();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('details');

  const [form, setForm] = useState({
    name: user?.full_name || profile.name,
    email: user?.email || profile.email,
    phone: user?.phone || profile.phone,
  });

  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const [np, setNp] = useState({
    name: '',
    age: '',
    gender: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);

  // Saved passengers are loaded from the backend database.
  const [savedPassengers, setSavedPassengers] = useState<ApiSavedPassenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(true);
  const [savingPassenger, setSavingPassenger] = useState(false);
  const [deletingPassengerId, setDeletingPassengerId] = useState<number | null>(
    null,
  );

  const upcoming = bookings.filter(
    (b) =>
      b.status !== 'Cancelled' &&
      b.date >= new Date().toLocaleDateString('en-CA'),
  ).length;

  const displayName = user?.full_name || profile.name || 'Hello, traveller.';
  const displayEmail =
    user?.email || profile.email || 'Add your email to speed up booking';
  const initial = displayName.trim()[0]?.toUpperCase() || 'S';

  // Load personal profile from the backend.
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        if (!active) return;

        setForm({
          name: data.full_name,
          email: data.email,
          phone: data.phone || '',
        });

        save({
          ...profile,
          name: data.full_name,
          email: data.email,
          phone: data.phone || '',
        });
      } catch (error) {
        if (active) {
          notice(
            error instanceof Error
              ? error.message
              : 'Unable to load your profile.',
            'error',
          );
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Load saved passengers from the authenticated user's database records.
  useEffect(() => {
    let active = true;

    const loadPassengers = async () => {
      try {
        const passengers = await getSavedPassengers();

        if (active) {
          setSavedPassengers(passengers);
        }
      } catch (error) {
        if (active) {
          notice(
            error instanceof Error
              ? error.message
              : 'Unable to load saved passengers.',
            'error',
          );
        }
      } finally {
        if (active) {
          setLoadingPassengers(false);
        }
      }
    };

    void loadPassengers();

    return () => {
      active = false;
    };
  }, []);

  const saveDetails = async () => {
    const next: typeof errors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      notice('Name must contain at least 2 characters.', 'error');
      return;
    }

    if (form.email && !emailOk(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
      next.phone = 'Enter a 10-digit mobile number.';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      notice('Please fix the highlighted fields.', 'error');
      return;
    }

    setSavingDetails(true);

    try {
      const updated = await updateMyProfile({
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      save({
        ...profile,
        name: updated.full_name,
        email: updated.email,
        phone: updated.phone || '',
      });

      updateUser(updated);

      setForm({
        name: updated.full_name,
        email: updated.email,
        phone: updated.phone || '',
      });

      notice('Profile updated successfully!', 'success');
    } catch (error) {
      notice(
        error instanceof Error
          ? error.message
          : 'Unable to update your profile.',
        'error',
      );
    } finally {
      setSavingDetails(false);
    }
  };

  // Add a passenger to the backend database.
  const addPassenger = async () => {
    if (
      !np.name.trim() ||
      np.name.trim().length < 2 ||
      !np.age ||
      !Number.isInteger(Number(np.age)) ||
      Number(np.age) < 1 ||
      Number(np.age) > 120 ||
      !np.gender
    ) {
      notice('Enter a valid name, age and gender.', 'error');
      return;
    }

    if (savedPassengers.length >= 8) {
      notice('You can save up to 8 passengers.', 'info');
      return;
    }

    setSavingPassenger(true);

    try {
      const passenger = await addSavedPassengerApi({
        name: np.name.trim(),
        age: Number(np.age),
        gender: np.gender,
      });

      setSavedPassengers((current) => [...current, passenger]);
      setNp({ name: '', age: '', gender: '' });

      notice('Passenger saved successfully!', 'success');
    } catch (error) {
      notice(
        error instanceof Error
          ? error.message
          : 'Unable to save passenger.',
        'error',
      );
    } finally {
      setSavingPassenger(false);
    }
  };

  // Delete a passenger from the backend database.
  const removePassenger = async (passenger: ApiSavedPassenger) => {
    if (deletingPassengerId !== null) return;

    setDeletingPassengerId(passenger.id);

    try {
      await deleteSavedPassenger(passenger.id);

      setSavedPassengers((current) =>
        current.filter((item) => item.id !== passenger.id),
      );

      notice('Passenger removed successfully.', 'success');
    } catch (error) {
      notice(
        error instanceof Error
          ? error.message
          : 'Unable to remove passenger.',
        'error',
      );
    } finally {
      setDeletingPassengerId(null);
    }
  };

  const setPref = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => {
    save({
      ...profile,
      prefs: { ...profile.prefs, [key]: value },
    });
  };

  return (
    <div className="page-wrap inner-page narrow-page profile-page">
      <div className="inner-heading">
        <span className="eyebrow">YOUR SPACE</span>
        <h1>Your profile.</h1>
        <p>
          Manage your account details and personalise your Tripzo experience.
          Your account details are saved securely through the backend.
        </p>
      </div>

      <div className="profile-panel">
        <div className="profile-avatar">{initial}</div>

        <div className="profile-who">
          <h2>{displayName}</h2>
          <p>{displayEmail}</p>
        </div>

        <div className="profile-stats">
          <div>
            <strong>{bookings.length}</strong>
            <small>BOOKINGS</small>
          </div>
          <div>
            <strong>{upcoming}</strong>
            <small>UPCOMING</small>
          </div>
          <div>
            <strong>{savedPassengers.length}</strong>
            <small>PASSENGERS</small>
          </div>
        </div>
      </div>

      <div className="profile-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <section className="profile-card">
          <h3>Personal details</h3>
          <p className="profile-hint">
            Used to pre-fill the contact step when you book.
          </p>

          {loadingProfile && (
            <p className="profile-hint">Loading your account details...</p>
          )}

          <div className="profile-form">
            <label>
              Display name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="What should we call you?"
                maxLength={100}
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                value={form.email}
                aria-invalid={!!errors.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setErrors({ ...errors, email: undefined });
                }}
                placeholder="you@example.com"
              />
              {errors.email && (
                <em className="field-error">{errors.email}</em>
              )}
            </label>

            <label>
              Mobile number
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                aria-invalid={!!errors.phone}
                onChange={(e) => {
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                  });
                  setErrors({ ...errors, phone: undefined });
                }}
                placeholder="10-digit mobile number"
              />
              {errors.phone && (
                <em className="field-error">{errors.phone}</em>
              )}
            </label>
          </div>

          <button
            className="primary-btn"
            onClick={saveDetails}
            disabled={savingDetails || loadingProfile}
          >
            {savingDetails ? 'Saving...' : 'Save details'}
            <ArrowRight size={17} />
          </button>
        </section>
      )}

      {tab === 'passengers' && (
        <section className="profile-card">
          <h3>Saved passengers</h3>
          <p className="profile-hint">
            Frequent co-travellers, ready to quick-fill on the passenger step.
          </p>

          {loadingPassengers ? (
            <p className="profile-hint">Loading saved passengers...</p>
          ) : savedPassengers.length ? (
            <ul className="saved-passengers">
              {savedPassengers.map((p) => (
                <li key={p.id}>
                  <span className="mini-avatar">
                    {p.name[0]?.toUpperCase()}
                  </span>

                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.age} yrs · {p.gender}
                    </small>
                  </span>

                  <button
                    aria-label={`Remove ${p.name}`}
                    disabled={deletingPassengerId !== null}
                    onClick={() => void removePassenger(p)}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="profile-empty">
              No saved passengers yet. Add someone below.
            </p>
          )}

          <div className="profile-form passenger-add">
            <label className="wide">
              Full name
              <input
                value={np.name}
                onChange={(e) => setNp({ ...np, name: e.target.value })}
                placeholder="As on their ID"
                maxLength={60}
              />
            </label>

            <label>
              Age
              <input
                type="number"
                min="1"
                max="120"
                step="1"
                value={np.age}
                onChange={(e) => setNp({ ...np, age: e.target.value })}
                placeholder="Age"
              />
            </label>

            <label>
              Gender
              <select
                value={np.gender}
                onChange={(e) => setNp({ ...np, gender: e.target.value })}
              >
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </label>
          </div>

          <button
            className="primary-btn"
            onClick={() => void addPassenger()}
            disabled={savingPassenger || loadingPassengers}
          >
            <Plus size={17} />
            {savingPassenger ? 'Saving passenger...' : 'Add passenger'}
          </button>
        </section>
      )}

      {tab === 'history' && (
        <section className="profile-card">
          <h3>Booking history</h3>
          <p className="profile-hint">
            Bookings currently shown from your existing booking history.
          </p>

          {bookings.length ? (
            <BookingHistory
              bookings={bookings}
              onOpen={(b) => navigate(`/confirmation/${b.reference}`)}
            />
          ) : (
            <div className="profile-empty">
              <p>No bookings yet. Your bookings will appear here.</p>
              <Link className="primary-btn" to="/">
                Plan a journey <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </section>
      )}

      {tab === 'preferences' && (
        <section className="profile-card">
          <h3>Preferences</h3>
          <p className="profile-hint">
            These preferences are currently saved on this device.
          </p>

          <div className="profile-form">
            <label>
              Seat preference
              <select
                value={profile.prefs.seat}
                onChange={(e) =>
                  setPref('seat', e.target.value as Preferences['seat'])
                }
              >
                <option>No preference</option>
                <option>Window</option>
                <option>Aisle</option>
              </select>
            </label>

            <label>
              Preferred bus type
              <select
                value={profile.prefs.busType}
                onChange={(e) =>
                  setPref('busType', e.target.value as Preferences['busType'])
                }
              >
                <option>Any</option>
                <option>AC Sleeper</option>
                <option>AC Seater</option>
                <option>Non-AC Sleeper</option>
                <option>Non-AC Seater</option>
              </select>
            </label>

            <label>
              Language
              <select
                value={profile.prefs.language}
                onChange={(e) =>
                  setPref(
                    'language',
                    e.target.value as Preferences['language'],
                  )
                }
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
              </select>
              <small className="field-note">
                Preference is saved; the interface is currently in English.
              </small>
            </label>
          </div>

          <div className="pref-group">
            <h4>
              <Bell size={16} /> Notifications
            </h4>

            <Toggle
              checked={profile.prefs.notifyBookings}
              onChange={(v) => setPref('notifyBookings', v)}
              label="Booking updates"
              hint="Status changes for your bookings"
            />

            <Toggle
              checked={profile.prefs.notifyOffers}
              onChange={(v) => setPref('notifyOffers', v)}
              label="Offers & deals"
              hint="Coupon and route highlights"
            />

            <small className="field-note">
              Notification preferences are saved locally; no messages are sent.
            </small>
          </div>

          <button
            className="outline-btn danger-outline"
            onClick={() => {
              reset();
              setForm({ name: '', email: '', phone: '' });
              notice(
                'Local profile preferences cleared from this device.',
                'info',
              );
            }}
          >
            Reset profile
          </button>
        </section>
      )}

      <div className="profile-shortcuts">
        <Link to="/bookings">
          <Ticket size={18} /> My Bookings <ArrowRight size={16} />
        </Link>
        <Link to="/routes">
          <Check size={18} /> Explore Routes <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
