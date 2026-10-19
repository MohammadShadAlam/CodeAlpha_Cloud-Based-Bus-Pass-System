import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookUser, BusFront, CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, Ticket, UserRound, Zap } from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import { useProfile } from '../hooks/useProfile';
import './Signup.css';
import { registerUser } from '../api';

type Field = 'name' | 'email' | 'phone' | 'password' | 'confirm' | 'agree';
type Values = { name: string; email: string; phone: string; password: string; confirm: string; agree: boolean };

const empty: Values = { name: '', email: '', phone: '', password: '', confirm: '', agree: false };
const ORDER: Field[] = ['name', 'email', 'phone', 'password', 'confirm', 'agree'];
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

function passwordScore(p: string) {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) score++;
  return p.length < 8 ? Math.min(score, 1) : score;
}

function validate(v: Values): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (!/^\p{L}[\p{L}\s.'-]{1,59}$/u.test(v.name.trim())) e.name = 'Enter your full name (at least 2 letters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!/^[6-9]\d{9}$/.test(v.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (v.password.length < 8 || !/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = 'Use at least 8 characters with a letter and a number.';
  if (!v.confirm || v.confirm !== v.password) e.confirm = 'Passwords do not match.';
  if (!v.agree) e.agree = 'Please accept the Terms and Privacy Policy to continue.';
  return e;
}

// Frontend-only sign-up. The password is checked but never stored or sent anywhere.
// Name, email and mobile are saved to this browser's profile, so booking forms get pre-filled.
export default function SignupPage() {
  const { notice } = useBooking();
  const { profile, save } = useProfile();
  const [values, setValues] = useState<Values>(empty);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const errors = useMemo(() => validate(values), [values]);
  const score = passwordScore(values.password);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues(prev => ({ ...prev, [key]: value }));
  const blur = (f: Field) => setTouched(prev => ({ ...prev, [f]: true }));
  const err = (f: Field) => (touched[f] ? errors[f] : undefined);

  
const [submitting, setSubmitting] = useState(false);

const submit = async (ev: FormEvent) => {
  ev.preventDefault();

  if (submitting) return;

  const first = ORDER.find(f => errors[f]);

  if (first) {
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirm: true,
      agree: true,
    });

    document.getElementById(`signup-${first}`)?.focus();
    notice('Please fix the highlighted fields.', 'error');
    return;
  }

  setSubmitting(true);

  try {
    await registerUser({
      full_name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone,
      password: values.password,
    });

    save({
      ...profile,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone,
    });

    setDone(true);
    notice('Account created successfully!', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    notice(
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.',
      'error'
    );
  } finally {
    setSubmitting(false);
  }
};


  const perks = [
    { icon: Zap, title: 'Book in seconds', text: 'Your contact details fill in automatically.' },
    { icon: BookUser, title: 'Save co-travellers', text: 'Keep frequent passengers ready to quick-fill.' },
    { icon: Ticket, title: 'Keep your trips together', text: 'Find every demo booking in one place.' },
  ];

  return <div className="signup-page"><div className="signup-shell">
    <aside className="signup-aside">
      <Link to="/" className="signup-brand"><span className="signup-brand-mark"><BusFront size={20} strokeWidth={2.5} /></span>tripzo<span className="signup-dot">.</span></Link>
      <h2>Every journey starts with a <em>hello.</em></h2>
      <p className="signup-aside-lead">Create your Tripzo profile and make your next bus trip across India a little easier.</p>
      <ul className="signup-perks">{perks.map(p => <li key={p.title}><span><p.icon size={17} /></span><div><strong>{p.title}</strong><small>{p.text}</small></div></li>)}</ul>
      <p className="signup-aside-note"><ShieldCheck size={15} /> Frontend demo: no real account is created and your password is never saved.</p>
    </aside>

    <section className="signup-main">
      {done ? <div className="signup-done" role="status">
        <span className="signup-done-icon"><CheckCircle2 size={40} /></span>
        <h1>Welcome to Tripzo, {values.name.trim().split(/\s+/)[0]}!</h1>
        <p>Your details are saved on this device and will pre-fill your next booking.</p>
        <div className="signup-done-actions"><Link className="signup-submit" to="/">Plan a journey <ArrowRight size={18} /></Link><Link className="signup-secondary" to="/profile">View my profile</Link></div>
      </div> : <>
        <span className="signup-eyebrow">CREATE YOUR PROFILE</span>
        <h1>Sign up for Tripzo.</h1>
        <p className="signup-sub">It takes less than a minute. No payment needed.</p>
        <form className="signup-form" onSubmit={submit} noValidate>
          <div className={`signup-field ${err('name') ? 'invalid' : ''}`}>
            <label htmlFor="signup-name">Full name</label>
            <div className="signup-input"><UserRound size={18} /><input id="signup-name" autoComplete="name" maxLength={60} placeholder="As on your ID" value={values.name} onChange={e => set('name', e.target.value)} onBlur={() => blur('name')} aria-invalid={!!err('name')} aria-describedby="signup-name-err" /></div>
            <em id="signup-name-err" role="alert">{err('name')}</em>
          </div>
          <div className="signup-row">
            <div className={`signup-field ${err('email') ? 'invalid' : ''}`}>
              <label htmlFor="signup-email">Email address</label>
              <div className="signup-input"><Mail size={18} /><input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={e => set('email', e.target.value)} onBlur={() => blur('email')} aria-invalid={!!err('email')} aria-describedby="signup-email-err" /></div>
              <em id="signup-email-err" role="alert">{err('email')}</em>
            </div>
            <div className={`signup-field ${err('phone') ? 'invalid' : ''}`}>
              <label htmlFor="signup-phone">Mobile number</label>
              <div className="signup-input"><Phone size={18} /><span className="signup-prefix">+91</span><input id="signup-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit number" value={values.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={() => blur('phone')} aria-invalid={!!err('phone')} aria-describedby="signup-phone-err" /></div>
              <em id="signup-phone-err" role="alert">{err('phone')}</em>
            </div>
          </div>
          <div className="signup-row">
            <div className={`signup-field ${err('password') ? 'invalid' : ''}`}>
              <label htmlFor="signup-password">Password</label>
              <div className="signup-input"><Lock size={18} /><input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 characters" value={values.password} onChange={e => set('password', e.target.value)} onBlur={() => blur('password')} aria-invalid={!!err('password')} aria-describedby="signup-password-err" /><button type="button" className="signup-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              {values.password && <div className={`signup-strength s${score}`} aria-live="polite"><span><i /><i /><i /><i /></span><small>{STRENGTH[score]}</small></div>}
              <em id="signup-password-err" role="alert">{err('password')}</em>
            </div>
            <div className={`signup-field ${err('confirm') ? 'invalid' : ''}`}>
              <label htmlFor="signup-confirm">Confirm password</label>
              <div className="signup-input"><Lock size={18} /><input id="signup-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter password" value={values.confirm} onChange={e => set('confirm', e.target.value)} onBlur={() => blur('confirm')} aria-invalid={!!err('confirm')} aria-describedby="signup-confirm-err" /></div>
              <em id="signup-confirm-err" role="alert">{err('confirm')}</em>
            </div>
          </div>
          <div className={`signup-check ${err('agree') ? 'invalid' : ''}`}>
            <label><input id="signup-agree" type="checkbox" checked={values.agree} onChange={e => { set('agree', e.target.checked); blur('agree'); }} aria-invalid={!!err('agree')} /><span>I agree to the <Link to="/terms">Terms &amp; Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label>
            <em role="alert">{err('agree')}</em>
          </div>
          <button
  className="signup-submit"
  type="submit"
  disabled={submitting}
>
  {submitting ? 'Creating account...' : 'Create account'}
  {!submitting && <ArrowRight size={18} />}
</button>
  
<p className="signup-login-link">
  Already have an account?{' '}
  <Link to="/login">Log in</Link>
</p>

          <p className="signup-foot">Just looking around? <Link to="/">Continue as guest</Link></p>
        </form>
      </>}
    </section>
  </div></div>;
}
