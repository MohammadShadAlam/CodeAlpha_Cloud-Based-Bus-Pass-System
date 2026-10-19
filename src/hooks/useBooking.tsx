import { createContext, useContext, useState } from 'react';
import { locations, todayISO } from '../data';
import type { Booking, Location } from '../types';

type Store = { pickup:Location|null; drop:Location|null; setPickup:(v:Location|null)=>void; setDrop:(v:Location|null)=>void; swap:()=>void; date:string; setDate:(v:string)=>void; count:number; setCount:(v:number)=>void; bookings:Booking[]; addBooking:(b:Booking)=>void; cancelBooking:(ref:string)=>void; recent:Location[]; notice:(message:string,kind?:'success'|'error'|'info')=>void; notification:{message:string;kind:'success'|'error'|'info'}|null; clearNotice:()=>void };
const Context = createContext<Store | null>(null);
const readBookings = ():Booking[] => { try { return JSON.parse(localStorage.getItem('tripzo-bookings') || '[]'); } catch { return []; } };
const readRecent = ():Location[] => { try { return JSON.parse(localStorage.getItem('tripzo-recent') || '[]'); } catch { return []; } };
export function BookingProvider({children}:{children:React.ReactNode}) {
  const [pickup, setPickupState] = useState<Location|null>(locations[0]);
  const [drop, setDropState] = useState<Location|null>(locations[4]);
  const [date,setDate]=useState(todayISO());
  const [count,setCount]=useState(1);
  const [bookings,setBookings]=useState<Booking[]>(readBookings);
  const [recent,setRecent]=useState<Location[]>(readRecent);
  const [notification,setNotification]=useState<Store['notification']>(null);
  const remember=(v:Location|null)=>{if(!v)return;setRecent(prev=>{const next=[v,...prev.filter(p=>p.id!==v.id)].slice(0,5);localStorage.setItem('tripzo-recent',JSON.stringify(next));return next;});};
  const setPickup=(v:Location|null)=>{setPickupState(v);remember(v);};
  const setDrop=(v:Location|null)=>{setDropState(v);remember(v);};
  const swap=()=>{setPickupState(drop);setDropState(pickup);};
  const addBooking=(b:Booking)=>setBookings(prev=>{const next=[b,...prev];localStorage.setItem('tripzo-bookings',JSON.stringify(next));return next;});
  const cancelBooking=(ref:string)=>setBookings(prev=>{const next=prev.map(b=>b.reference===ref?{...b,status:'Cancelled' as const}:b);localStorage.setItem('tripzo-bookings',JSON.stringify(next));return next;});
  const notice=(message:string,kind:'success'|'error'|'info'='info')=>setNotification({message,kind});
  return <Context.Provider value={{pickup,drop,setPickup,setDrop,swap,date,setDate,count,setCount,bookings,addBooking,cancelBooking,recent,notice,notification,clearNotice:()=>setNotification(null)}}>{children}</Context.Provider>;
}
export function useBooking(){const value=useContext(Context);if(!value)throw new Error('BookingProvider missing');return value;}