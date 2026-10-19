import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BusFront,
  Check,
  ChevronRight,
  Info,
  LockKeyhole,
  Tag,
} from 'lucide-react';
import { getBuses, createBooking, } from '../api';
import type { Bus, Booking } from '../types';
import { SeatSelector } from '../components/BusComponents';
import { useBooking } from '../hooks/useBooking';
import { useProfile } from '../hooks/useProfile';

const occupied=[2,7,11,15,20,23,26,31];
export default function BookingPage(){const { id } = useParams();
const navigate = useNavigate();

const [apiBuses, setApiBuses] = useState<Bus[]>([]);
const [loadingBus, setLoadingBus] = useState(true);
const [busError, setBusError] = useState('');

useEffect(() => {
  let isActive = true;

  getBuses()
    .then((data) => {
      if (!isActive) return;

      const selectedBus = data.find((item) => String(item.id) === id);

      if (selectedBus) {
        const departureHour = Number(selectedBus.departure_time.slice(0, 2));
        const arrivalHour = Number(selectedBus.arrival_time.slice(0, 2));
        const hours = (arrivalHour - departureHour + 24) % 24 || 24;

        const mappedBus: Bus = {
          id: String(selectedBus.id),
          operator: selectedBus.operator_name,
          service: `${selectedBus.source} - ${selectedBus.destination}`,
          type: 'AC Sleeper',
          departure: selectedBus.departure_time,
          arrival: selectedBus.arrival_time,
          duration: `${hours}h`,
          hours,
          fare: selectedBus.fare,
          seats: selectedBus.total_seats,
          rating: 0,
          boarding: selectedBus.source,
          dropping: selectedBus.destination,
          amenities: [],
        };

        setApiBuses([mappedBus]);
      } else {
        setBusError('This bus was not found in the database.');
      }
    })
    .catch((error: unknown) => {
      if (!isActive) return;

      setBusError(
        error instanceof Error ? error.message : 'Unable to load bus details.'
      );
    })
    .finally(() => {
      if (isActive) setLoadingBus(false);
    });

  return () => {
    isActive = false;
  };
}, [id]);

const bus = apiBuses[0];const {pickup,drop,date,count,addBooking,notice}=useBooking();const {profile}=useProfile();const [seats,setSeats]=useState<number[]>([]);const [passengers,setPassengers]=useState(Array.from({length:count},()=>({name:'',age:'',gender:''})));const [email,setEmail]=useState(profile.email);const [phone,setPhone]=useState(profile.phone);const [coupon,setCoupon]=useState('');const [applied,setApplied]=useState(false);const [step,setStep]=useState(1);
 if (loadingBus) {
  return (
    <div className="page-wrap empty-state">
      <BusFront size={40} />
      <h2>Loading your bus...</h2>
      <p>Please wait while we fetch the bus details.</p>
    </div>
  );
}

if (busError) {
  return (
    <div className="page-wrap empty-state">
      <BusFront size={40} />
      <h2>Unable to load bus</h2>
      <p>{busError}</p>
      <Link className="primary-btn" to="/search">
        Back to buses <ArrowRight size={18} />
      </Link>
    </div>
  );
}

if (!bus) {
  return (
    <div className="page-wrap empty-state">
      <BusFront size={40} />
      <h2>Bus not found</h2>
      <p>Please select a bus from the search results again.</p>
      <Link className="primary-btn" to="/search">
        Back to buses <ArrowRight size={18} />
      </Link>
    </div>
  );
}

if (!pickup || !drop) {
  return (
    <div className="page-wrap empty-state">
      <BusFront size={40} />
      <h2>Choose your route first</h2>
      <p>Please select your pickup and drop locations before booking.</p>
      <Link className="primary-btn" to="/search">
        Search buses <ArrowRight size={18} />
      </Link>
    </div>
  );
}
  const discount=applied?Math.round(bus.fare*count*.1):0;const base=bus.fare*count;const fee=49;const total=base+fee-discount;
  const updatePassenger=(i:number,key:'name'|'age'|'gender',value:string)=>setPassengers(prev=>prev.map((p,j)=>j===i?{...p,[key]:value}:p));
  const next=()=>{if(step===1&&seats.length!==count){notice(`Please select ${count} ${count===1?'seat':'seats'} to continue.`,'error');return;}if(step===2){if(passengers.some(p=>!p.name.trim()||!p.age||Number(p.age)<1||Number(p.age)>120||!p.gender)){notice('Enter a valid name, age and gender for every passenger.','error');return;}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\d{10}$/.test(phone)){notice('Enter a valid email and 10-digit phone number.','error');return;}}setStep(step+1);window.scrollTo({top:0,behavior:'smooth'});};
  const applyCoupon=()=>{if(coupon.trim().toUpperCase()==='TRIPZO10'){setApplied(true);notice('TRIPZO10 applied. 10% off the seat fare!','success');}else{setApplied(false);notice('Invalid demo coupon. Try TRIPZO10.','error');}};
  

const confirm = async () => {
  try {
    const savedBooking = await createBooking({
      bus_id: Number(bus.id),
      seats_booked: seats.length,
    });

    const booking: Booking = {
      reference: `TZ${savedBooking.booking_id}`,
      bus,
      pickup,
      drop,
      date,
      seats: [...seats].sort((a, b) => a - b),
      passengers,
      email,
      phone,
      total,
      discount,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    navigate(`/confirmation/${booking.reference}`);
  } catch (error) {
    notice(
      error instanceof Error
        ? error.message
        : 'Booking failed. Please try again.',
      'error'
    );
  }
};

  return <div className="page-wrap booking-page"><div className="page-top"><Link className="back-link" to={step===1?'/search':'#'} onClick={e=>{if(step>1){e.preventDefault();setStep(step-1);}}}><ArrowLeft size={17}/> {step===1?'Back to buses':'Previous step'}</Link><span className="demo-badge">DEMO BOOKING · NO PAYMENT</span></div><div className="booking-title"><span className="eyebrow">ALMOST ON YOUR WAY</span><h1>Make it your journey.</h1><p>{pickup.city} <ChevronRight size={15}/> {drop.city} · {bus.operator}</p></div><div className="step-indicator">{['Select seats','Passenger details','Review booking'].map((label,i)=><div key={label} className={`step ${step===i+1?'active':''} ${step>i+1?'done':''}`}><span>{step>i+1?<Check size={15}/>:i+1}</span>{label}</div>)}</div><div className="booking-layout"><div className="booking-workspace">{step===1&&<section className="form-section"><div className="section-intro"><span className="small-icon"><BusFront size={19}/></span><div><h2>Choose your seats</h2><p>Pick {count} {count===1?'seat':'seats'} from the available options below.</p></div></div><SeatSelector seats={seats} occupied={occupied} max={count} onToggle={n=>{if(seats.includes(n))setSeats(seats.filter(s=>s!==n));else if(seats.length<count)setSeats([...seats,n]);else notice(`You can select up to ${count} seats.`, 'info');}}/><button className="primary-btn continue-btn" onClick={next}>Continue to passenger details <ArrowRight size={18}/></button></section>}
    {step===2&&<section className="form-section"><div className="section-intro"><span className="small-icon"><BadgeCheck size={19}/></span><div><h2>Passenger details</h2><p>Enter details for everyone travelling with you.</p></div></div>{profile.passengers.length>0&&<div className="quick-fill"><span>Quick fill from saved passengers</span><div>{profile.passengers.map(sp=><button type="button" key={sp.id} onClick={()=>{const i=passengers.findIndex(p=>!p.name.trim());if(i<0){notice('All passenger forms are already filled.','info');return;}setPassengers(prev=>prev.map((p,j)=>j===i?{name:sp.name,age:sp.age,gender:sp.gender}:p));}}>+ {sp.name}</button>)}</div></div>}{passengers.map((p,i)=><div className="passenger-form" key={i}><h3>Passenger {i+1} <span>Seat {seats[i]}</span></h3><div className="form-grid"><label className="wide">Full name<input value={p.name} onChange={e=>updatePassenger(i,'name',e.target.value)} placeholder="As on your ID" maxLength={60}/></label><label>Age<input type="number" min="1" max="120" value={p.age} onChange={e=>updatePassenger(i,'age',e.target.value)} placeholder="Age"/></label><label>Gender<select value={p.gender} onChange={e=>updatePassenger(i,'gender',e.target.value)}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label></div></div>)}<div className="passenger-form"><h3>Contact information</h3><div className="form-grid"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Mobile number<input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit mobile number"/></label></div><p className="form-note"><Info size={15}/> This is a local demo. No messages or tickets are sent.</p></div><button className="primary-btn continue-btn" onClick={next}>Review your booking <ArrowRight size={18}/></button></section>}
    {step===3&&<section className="form-section"><div className="section-intro"><span className="small-icon"><Check size={19}/></span><div><h2>Review your booking</h2><p>Take a last look before confirming your demo reservation.</p></div></div><div className="review-route"><div><small>DEPARTURE</small><strong>{bus.departure}</strong><span>{pickup.name}, {pickup.city}</span></div><span className="review-route-line"/><div><small>ARRIVAL (EST.)</small><strong>{bus.arrival}</strong><span>{drop.name}, {drop.city}</span></div></div><div className="review-list"><div><span>Service</span><strong>{bus.operator} · {bus.type}</strong></div><div><span>Travel date</span><strong>{new Date(date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</strong></div><div><span>Selected seats</span><strong>{seats.sort((a,b)=>a-b).join(', ')}</strong></div><div><span>Passengers</span><strong>{passengers.map(p=>p.name).join(', ')}</strong></div><div><span>Contact</span><strong>{email} · {phone}</strong></div></div><div className="demo-notice"><Info size={20}/><p><strong>This is a demo, not a real bus ticket.</strong> Confirming saves a sample booking in this browser only. No payment is collected and no seat is reserved with an operator.</p></div><button className="primary-btn continue-btn" onClick={confirm}>Confirm demo booking <ArrowRight size={18}/></button></section>}
  </div><aside className="fare-panel"><div className="fare-head"><h3>Fare summary</h3><span>{bus.service}</span></div><p className="fare-trip">{pickup.city} <ArrowRight size={15}/> {drop.city}</p><div className="fare-divider"/><div className="fare-row"><span>Seat fare × {count}</span><strong>₹{base.toLocaleString('en-IN')}</strong></div><div className="fare-row"><span>Demo convenience fee</span><strong>₹{fee}</strong></div>{applied&&<div className="fare-row discount"><span>TRIPZO10 discount</span><strong>-₹{discount}</strong></div>}<div className="coupon-row"><input aria-label="Coupon code" placeholder="Enter coupon code" value={coupon} onChange={e=>setCoupon(e.target.value)} disabled={applied}/><button onClick={applied?()=>{setApplied(false);setCoupon('');}:applyCoupon}>{applied?'Remove':'Apply'}</button></div><p className="coupon-hint"><Tag size={14}/> Try TRIPZO10 for 10% off</p><div className="fare-total"><span>Total (demo)</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><p className="safe-note"><LockKeyhole size={14}/> No payment required. Frontend preview only.</p></aside></div></div>;
}