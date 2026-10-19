import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import { BookingProvider } from './hooks/useBooking';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import BookingsPage, { ConfirmationPage } from './pages/BookingsPage';
import { AboutPage, ContactPage, DestinationsPage, FAQPage, HelpPage, LegalPage, OffersPage, OperatorsPage, RoutesPage, TrackPage } from './pages/ExplorePages';

export default function App(){return <BrowserRouter><BookingProvider><Routes><Route element={<SiteLayout/>}>
<Route index element={<HomePage/>}/>
<Route path="signup" element={<SignupPage />} />
<Route path="login" element={<LoginPage />} />
<Route path="search" element={<SearchPage/>}/>
<Route path="book/:id" element={<BookingPage/>}/>
<Route path="confirmation/:reference" element={<ConfirmationPage/>}/>
<Route path="bookings" element={<BookingsPage/>}/>
<Route path="track" element={<TrackPage/>}/>
<Route path="routes" element={<RoutesPage/>}/>
<Route path="destinations" element={<DestinationsPage/>}/>
<Route path="operators" element={<OperatorsPage/>}/>
<Route path="offers" element={<OffersPage/>}/>
<Route path="help" element={<HelpPage/>}/>
<Route path="faq" element={<FAQPage/>}/>
<Route path="about" element={<AboutPage/>}/>
<Route path="contact" element={<ContactPage/>}/>
<Route path="profile" element={<ProfilePage/>}/>
<Route path="terms" element={<LegalPage kind="terms"/>}/>
<Route path="privacy" element={<LegalPage kind="privacy"/>}/>
<Route path="*" element={<div className="page-wrap empty-state">
<h1>Wrong turn?</h1><p>That page is not on our route.</p>
<Link className="primary-btn" to="/">Back to the map</Link>
</div>}/></Route></Routes></BookingProvider></BrowserRouter>}