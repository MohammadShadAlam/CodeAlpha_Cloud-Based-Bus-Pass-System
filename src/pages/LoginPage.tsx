import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, BusFront, Eye, EyeOff, Lock, Map as MapIcon, ShieldCheck, Ticket, UserRound, Zap } from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import { useProfile } from '../hooks/useProfile';
import './signup.css'; // shared look with the Sign-up page
import './login.css';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

type Field = 'identifier' | 'password';
const REMEMBER_KEY = 'tripzo-remember';
const SESSION_KEY = 'tripzo-session';

// "ankit@example.com", "98765 43210", "+91 9876543210" and "09876543210" are all accepted.
const normalise = (raw: string) => {
  const v = raw.trim();
  if (v.includes('@')) return v.toLowerCase();
  const digits = v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
  return digits;
};
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isMobile = (v: string) => /^[6-9]\d{9}$/.test(v);

const readRemembered = () => { try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; } };

// Frontend-only demo sign-in. There is no server, so the password cannot be verified:
// it is only checked for format. Sign-in succeeds when the email or mobile matches the profile created on the Sign-up page.
export default function LoginPage() {
  const { notice } = useBooking();
  const { profile } = useProfile();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState(readRemembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => !!readRemembered());
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e: Partial<Record<Field, string>> = {};
    const id = normalise(identifier);
    if (!id) e.identifier = 'Enter your email or mobile number.';
    else if (!isEmail(id) && !isMobile(id)) e.identifier = 'Enter a valid email or 10-digit mobile number.';
    if (!password) e.password = 'Enter your password.';
    else if (password.length < 8) e.password = 'Passwords have at least 8 characters.';
    return e;
  }, [identifier, password]);
  const err = (f: Field) => (touched[f] ? errors[f] : undefined);
  const blur = (f: Field) => setTouched(prev => ({ ...prev, [f]: true }));
 


const submit = async (ev: FormEvent) => {
  ev.preventDefault();
  setFormError('');

  if (errors.identifier || errors.password) {
    setTouched({ identifier: true, password: true });
    document
      .getElementById(
        errors.identifier ? 'login-identifier' : 'login-password'
      )
      ?.focus();
    return;
  }

  const id = normalise(identifier);

  // Current backend accepts email + password, not mobile + password.
  if (!isEmail(id)) {
    setFormError('Please log in using your registered email address.');
    return;
  }

  setSubmitting(true);

  try {
    const data = await loginUser({
      email: id,
      password,
    });

    if (!data.access_token || !data.user) {
      throw new Error('Unexpected login response from the server.');
    }

    login(data.user, data.access_token);

    try {
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, identifier.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ signedIn: true, at: new Date().toISOString() })
      );
    } catch {
      // Login can continue if optional browser storage is unavailable.
    }

    notice(
      `Welcome back, ${data.user.full_name.split(/\s+/)[0]}!`,
      'success'
    );

    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from.startsWith('/') ? from : '/profile');
  } catch (error) {
    setFormError(
      error instanceof Error
        ? error.message
        : 'Login failed. Please try again.'
    );
  } finally {
    setSubmitting(false);
  }
};


  const perks = [
    { icon: MapIcon, title: 'Pick up where you left off', text: 'Your route and passengers are right here.' },
    { icon: Zap, title: 'Faster checkout', text: 'Contact details fill in automatically.' },
    { icon: Ticket, title: 'All trips in one place', text: 'See every demo booking and ticket.' },
  ];

  return <div className="signup-page"><div className="signup-shell">
    <aside className="signup-aside">
      <Link to="/" className="signup-brand"><span className="signup-brand-mark"><BusFront size={20} strokeWidth={2.5} /></span>tripzo<span className="signup-dot">.</span></Link>
      <h2>Good to see you <em>again.</em></h2>
      <p className="signup-aside-lead">Log in to pick up your journeys across India right where you left them.</p>
      <ul className="signup-perks">{perks.map(p => <li key={p.title}><span><p.icon size={17} /></span><div><strong>{p.title}</strong><small>{p.text}</small></div></li>)}</ul>
      <p className="signup-aside-note"><ShieldCheck size={15} /> Frontend demo: there is no server, so your password is not verified. Sign-in only checks the details you used on the Sign-up page.</p>
    </aside>

    <section className="signup-main">
      <span className="signup-eyebrow">WELCOME BACK</span>
      <h1>Log in to Tripzo.</h1>
      <p className="signup-sub">Use the email or mobile number you signed up with.</p>
      <form className="signup-form" onSubmit={submit} noValidate>
        {formError && <div className="login-form-error" role="alert"><AlertCircle size={18} /><span>{formError} {(!profile.email && !profile.phone) || formError.includes('sign up') ? <Link to="/signup">Create an account</Link> : null}</span></div>}
        <div className={`signup-field ${err('identifier') ? 'invalid' : ''}`}>
          <label htmlFor="login-identifier">Email or mobile number</label>
          <div className="signup-input"><UserRound size={18} /><input id="login-identifier" autoComplete="username" placeholder="you@example.com or 10-digit number" value={identifier} onChange={e => { setIdentifier(e.target.value); setFormError(''); }} onBlur={() => blur('identifier')} aria-invalid={!!err('identifier')} aria-describedby="login-identifier-err" /></div>
          <em id="login-identifier-err" role="alert">{err('identifier')}</em>
        </div>
        <div className={`signup-field ${err('password') ? 'invalid' : ''}`}>
          <label htmlFor="login-password">Password</label>
          <div className="signup-input"><Lock size={18} /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setFormError(''); }} onBlur={() => blur('password')} aria-invalid={!!err('password')} aria-describedby="login-password-err" /><button type="button" className="signup-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          <em id="login-password-err" role="alert">{err('password')}</em>
        </div>
        <div className="login-options">
          <div className="signup-check"><label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span>Remember me</span></label></div>
          <button type="button" className="login-forgot" onClick={() => notice('Password reset needs a server, so it is not available in this frontend demo.', 'info')}>Forgot password?</button>
        </div>
        <button
  className="signup-submit"
  type="submit"
  disabled={submitting}
>
  {submitting ? 'Logging in...' : 'Log in'}
  {!submitting && <ArrowRight size={18} />}
</button>
        <p className="signup-foot">New to Tripzo? <Link to="/signup">Create an account</Link> · <Link to="/">Continue as guest</Link></p>
      </form>
    </section>
  </div></div>;
}
