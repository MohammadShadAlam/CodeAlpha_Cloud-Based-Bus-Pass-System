export type Location = {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  type: string;
  lat: number;
  lng: number;
};

export type Bus = {
  id: string;
  operator: string;
  service: string;
  type: 'AC Sleeper' | 'AC Seater' | 'Non-AC Sleeper' | 'Non-AC Seater';
  departure: string;
  arrival: string;
  duration: string;
  hours: number;
  fare: number;
  seats: number;
  rating: number;
  boarding: string;
  dropping: string;
  amenities: string[];
};

export type Booking = {
  reference: string;
  bus: Bus;
  pickup: Location;
  drop: Location;
  date: string;
  seats: number[];
  passengers: { name: string; age: string; gender: string }[];
  email: string;
  phone: string;
  total: number;
  discount: number;
  status: 'Confirmed' | 'Cancelled';
  createdAt: string;
};