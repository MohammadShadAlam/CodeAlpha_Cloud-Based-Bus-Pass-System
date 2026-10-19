
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowUpRight,
  BusFront,
  ChevronDown,
  CircleHelp,
  Gift,
  MapPinned,
  Menu,
  Route,
  Ticket,
  UserRound,
  X,
  LogOut,
} from 'lucide-react';
import { Notification } from '../components/Common';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home', icon: MapPinned },
  { to: '/search', label: 'Book a Bus', icon: BusFront },
  { to: '/bookings', label: 'My Bookings', icon: Ticket },
  { to: '/track', label: 'Track Journey', icon: Route },
  { to: '/routes', label: 'Routes', icon: MapPinned },
  { to: '/offers', label: 'Offers', icon: Gift },
  { to: '/help', label: 'Help & Support', icon: CircleHelp },
];

export function Navbar() {
  const [menu, setMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

 const handleLogout = () => {
  logout();
  setProfileMenu(false);
  setMenu(false);
  navigate('/', { replace: true });
};

  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={() => setMenu(false)}>
        <span className="brand-mark">
          <BusFront size={23} strokeWidth={2.5} />
        </span>
        <span>
          tripzo<span className="brand-accent">.</span>
        </span>
      </Link>

      <nav className="desktop-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/search">Book a Bus</NavLink>
        <NavLink to="/bookings">My Bookings</NavLink>
        <NavLink to="/routes">Routes</NavLink>
        <NavLink to="/offers">Offers</NavLink>

        <div className="more-nav">
          <button type="button">
            More <ChevronDown size={15} />
          </button>
          <div className="more-dropdown">
            {links
              .filter((l) =>
                ['/track', '/help'].includes(l.to)
              )
              .map((l) => (
                <Link key={l.to} to={l.to}>
                  <l.icon size={16} />
                  {l.label}
                </Link>
              ))}
          </div>
        </div>
      </nav>

      <div className="nav-right">
        <span className="india-indicator">
          <span className="india-dot" />
          Made for India
        </span>

        {!user ? (
          <>
            <Link className="nav-login" to="/login">
              Log in
            </Link>
            <Link className="nav-signup" to="/signup">
              Create Account
            </Link>
          </>
        ) : (
          
<div className="more-nav profile-nav">
  <button
    type="button"
    className="nav-profile"
    title="Profile menu"
    aria-label="Open profile menu"
    aria-expanded={profileMenu}
    onClick={() => setProfileMenu(!profileMenu)}
  >
    <span className="profile-avatar">
      <UserRound size={20} />
    </span>
    <ChevronDown size={15} />
  </button>

  {profileMenu && (
    <div className="more-dropdown profile-dropdown">
      <div className="profile-dropdown-header">
        <span className="profile-avatar profile-avatar-large">
          <UserRound size={23} />
        </span>
        <div className="profile-account-text">
          <strong>{user.full_name}</strong>
          <span>{user.email}</span>
        </div>
      </div>

      <div className="profile-dropdown-divider" />

      <Link
        to="/profile"
        onClick={() => setProfileMenu(false)}
      >
        <UserRound size={17} />
        <span>My Profile</span>
      </Link>

      <Link
        to="/bookings"
        onClick={() => setProfileMenu(false)}
      >
        <Ticket size={17} />
        <span>My Bookings</span>
      </Link>

      <div className="profile-dropdown-divider" />

      <button
        type="button"
        className="profile-logout"
        onClick={handleLogout}
      >
        <LogOut size={17} />
        <span>Log out</span>
      </button>
    </div>
  )}
</div>

        )}

        <button
          className="mobile-menu-btn"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? 'Close menu' : 'Open menu'}
          type="button"
        >
          {menu ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menu && (
        <nav className="mobile-nav" key={location.pathname}>
          {links.map((l) => (
            <NavLink
              to={l.to}
              end={l.to === '/'}
              key={l.to}
              onClick={() => setMenu(false)}
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}

          {!user ? (
            <>
              <Link to="/login" onClick={() => setMenu(false)}>
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMenu(false)}>
                Create Account
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" onClick={() => setMenu(false)}>
                <UserRound size={18} />
                My Profile
              </Link>
              <button type="button" onClick={handleLogout}>
                <LogOut size={18} />
                Log out
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark">
              <BusFront size={20} />
            </span>
            <span>
              tripzo<span className="brand-accent">.</span>
            </span>
          </Link>
          <p>
            Going places, together. A thoughtfully designed demo for bus
            travel across India.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/routes">Popular Routes</Link>
          <Link to="/destinations">Destinations</Link>
          <Link to="/operators">Bus Operators</Link>
          <Link to="/offers">Offers</Link>
        </div>

        <div>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/help">Help & Support</Link>
          <Link to="/faq">FAQs</Link>
        </div>

        <div>
          <h4>Legal</h4>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <span className="footer-note">Frontend demonstration only.</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Tripzo. Designed for the journey.
        </span>
        <Link to="/">
          Explore the map <ArrowUpRight size={15} />
        </Link>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  const { notification, clearNotice } = useBooking();

  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {notification && (
        <Notification
          message={notification.message}
          kind={notification.kind}
          onClose={clearNotice}
        />
      )}
    </div>
  );
}
