import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X, Clock3, Navigation, ChevronDown } from 'lucide-react';
import { locations, states } from '../data';
import type { Location } from '../types';

type Props = { label: string; value: Location | null; onChange: (value: Location | null) => void; accent?: boolean; onCurrentLocation?: () => void; recent?: Location[] };
export default function LocationSearch({ label, value, onChange, accent, onCurrentLocation, recent = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All states & UTs');
  const [district, setDistrict] = useState('All districts');
  const [city, setCity] = useState('All cities / towns');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const districts = [...new Set(locations.filter(l => state === 'All states & UTs' || l.state === state).map(l => l.district))].sort();
  const cities = [...new Set(locations.filter(l => (state === 'All states & UTs' || l.state === state) && (district === 'All districts' || l.district === district)).map(l => l.city))].sort();
  const matches = locations.filter(l => (state === 'All states & UTs' || l.state === state) && (district === 'All districts' || l.district === district) && (city === 'All cities / towns' || l.city === city) && `${l.name} ${l.city} ${l.district} ${l.state} ${l.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7);
  const select = (l: Location) => { onChange(l); setQuery(''); setOpen(false); };
  return <div className="location-search" ref={ref}>
    <div className={`location-field ${open ? 'focused' : ''}`}>
      <div className={`field-dot ${accent ? 'orange' : 'purple'}`} />
      <div className="field-body" onClick={() => setOpen(true)}>
        <label>{label}</label>
        <input aria-label={label} value={open ? query : (value ? `${value.name}, ${value.city}` : '')} placeholder={open ? 'Search city, stand, station or landmark' : 'Search a location'} onFocus={() => { setOpen(true); setQuery(''); }} onChange={e => { setQuery(e.target.value); setOpen(true); }} />
      </div>
      {value && <button className="field-icon" title={`Clear ${label}`} aria-label={`Clear ${label}`} onClick={() => { onChange(null); setQuery(''); setOpen(true); }}><X size={17}/></button>}
      {!value && onCurrentLocation && <button className="field-icon" title="Use current location" aria-label="Use current location" onClick={onCurrentLocation}><Navigation size={17}/></button>}
    </div>
    {open && <div className="suggestions">
      <div className="suggestion-title"><Search size={15}/> Explore locations <span>DEMO DATA</span></div>
      <div className="hierarchy-row">
        <div className="select-wrap"><select aria-label="Select state or union territory" value={state} onChange={e => { setState(e.target.value); setDistrict('All districts'); setCity('All cities / towns'); }}><option>All states & UTs</option>{states.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div>
        <div className="select-wrap"><select aria-label="Select district" value={district} onChange={e => { setDistrict(e.target.value); setCity('All cities / towns'); }}><option>All districts</option>{districts.map(d => <option key={d}>{d}</option>)}</select><ChevronDown size={14}/></div>
      </div>
      <div className="hierarchy-row city-row"><div className="select-wrap"><select aria-label="Select city or town" value={city} onChange={e => setCity(e.target.value)}><option>All cities / towns</option>{cities.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14}/></div></div>
      {!query && state === 'All states & UTs' && recent.length > 0 && <><p className="suggestion-group">RECENTLY SELECTED</p>{recent.slice(0,2).map(l => <button className="suggestion-item" key={`recent-${l.id}`} onClick={() => select(l)}><Clock3 size={17}/><span><strong>{l.name}</strong><small>{l.city}, {l.state}</small></span></button>)}</>}
      <p className="suggestion-group">{query ? 'MATCHING LOCATIONS' : 'POPULAR PICKUP POINTS'}</p>
      {matches.length ? matches.map(l => <button className="suggestion-item" key={l.id} onClick={() => select(l)}><MapPin size={17}/><span><strong>{l.name}</strong><small>{l.city} · {l.district}, {l.state} · {l.type}</small></span></button>) : <div className="no-match">No demo locations found. Try another city or state.</div>}
      <div className="suggestion-foot">India → State / UT → District → City / Town → Pickup point<br/>Curated sample points only. More locations can be integrated later.</div>
    </div>}
  </div>;
}