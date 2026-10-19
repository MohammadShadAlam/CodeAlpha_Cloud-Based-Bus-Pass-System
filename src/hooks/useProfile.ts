import { useCallback, useState } from 'react';

export type SavedPassenger = { id: string; name: string; age: string; gender: string };
export type Preferences = { seat: 'No preference' | 'Window' | 'Aisle'; busType: 'Any' | 'AC Sleeper' | 'AC Seater' | 'Non-AC Sleeper' | 'Non-AC Seater'; language: 'English' | 'Hindi'; notifyBookings: boolean; notifyOffers: boolean };
export type Profile = { name: string; email: string; phone: string; passengers: SavedPassenger[]; prefs: Preferences };

const KEY = 'tripzo-profile';
export const defaultProfile = (): Profile => ({ name: '', email: '', phone: '', passengers: [], prefs: { seat: 'No preference', busType: 'Any', language: 'English', notifyBookings: true, notifyOffers: false } });

function read(): Profile {
  const base = defaultProfile();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    const legacyName = localStorage.getItem('tripzo-name') || '';
    if (!raw) return { ...base, name: legacyName };
    return { ...base, ...raw, prefs: { ...base.prefs, ...(raw.prefs || {}) }, passengers: Array.isArray(raw.passengers) ? raw.passengers : [] };
  } catch { return base; }
}

// Frontend-only profile: everything lives in this browser's localStorage. No account, no server.
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(read);
  const save = useCallback((next: Profile) => {
    setProfile(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); localStorage.setItem('tripzo-name', next.name); } catch { /* storage unavailable: keep in memory */ }
  }, []);
  const reset = useCallback(() => { try { localStorage.removeItem(KEY); localStorage.removeItem('tripzo-name'); } catch { /* ignore */ } setProfile(defaultProfile()); }, []);
  return { profile, save, reset };
}
