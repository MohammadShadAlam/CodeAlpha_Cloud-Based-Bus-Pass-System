import { CalendarDays, Minus, Plus, UsersRound, ArrowDownUp, ArrowRight, Route, Info } from 'lucide-react';
import LocationSearch from './LocationSearch';
import type { Location } from '../types';
import { todayISO } from '../data';

export function DateSelector({ date, onChange }: { date: string; onChange: (v: string) => void }) { return <label className="control-field"><CalendarDays size={19}/><span><small>TRAVEL DATE</small><input aria-label="Travel date" type="date" min={todayISO()} value={date} onChange={e => onChange(e.target.value)} /></span></label>; }
export function PassengerSelector({ count, onChange }: { count: number; onChange: (v: number) => void }) { return <div className="control-field"><UsersRound size={19}/><span><small>PASSENGERS</small><strong>{count} {count === 1 ? 'Passenger' : 'Passengers'}</strong></span><div className="stepper"><button aria-label="Remove passenger" disabled={count <= 1} onClick={() => onChange(count - 1)}><Minus size={14}/></button><button aria-label="Add passenger" disabled={count >= 6} onClick={() => onChange(count + 1)}><Plus size={14}/></button></div></div>; }
export function PickupDropPanel({ pickup, drop, setPickup, setDrop, swap, date, setDate, count, setCount, search, locate, recent }: { pickup: Location|null; drop: Location|null; setPickup: (l:Location|null)=>void; setDrop:(l:Location|null)=>void; swap:()=>void; date:string; setDate:(s:string)=>void; count:number; setCount:(n:number)=>void; search:()=>void; locate:()=>void; recent:Location[] }) {
  return <div className="pickup-drop-panel">
    <div className="locations-wrap"><div className="connector"/><LocationSearch label="Pickup Location" value={pickup} onChange={setPickup} onCurrentLocation={locate} recent={recent}/><button className="swap-btn" aria-label="Swap pickup and drop" title="Swap pickup and drop" onClick={swap}><ArrowDownUp size={18}/></button><LocationSearch label="Drop Location" value={drop} onChange={setDrop} accent recent={recent}/></div>
    <div className="controls-row"><DateSelector date={date} onChange={setDate}/><PassengerSelector count={count} onChange={setCount}/></div>
    <button className="primary-btn search-btn" onClick={search}>Search buses <ArrowRight size={19}/></button>
  </div>;
}
export function RoutePreview({ pickup, drop }: { pickup: Location|null; drop:Location|null }) { return <div className="route-preview"><div className="route-icon"><Route size={19}/></div><div><strong>{pickup && drop ? `${pickup.city} to ${drop.city}` : 'Your route preview'}</strong><p>{pickup && drop ? 'Approximate straight-line preview · not road navigation' : 'Choose two points to see your journey on the map'}</p></div><Info size={16} className="route-info"/></div>; }