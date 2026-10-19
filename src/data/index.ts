import type { Bus, Location } from '../types';

// State / UT names are complete; the nested points below are a curated demo subset.
export const states = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const point = (id: string, name: string, city: string, district: string, state: string, type: string, lat: number, lng: number): Location => ({ id, name, city, district, state, type, lat, lng });
export const locations: Location[] = [
  point('patna', 'Patna Junction', 'Patna', 'Patna', 'Bihar', 'Railway station', 25.6031, 85.1376),
  point('patna-bus', 'Mithapur Bus Stand', 'Patna', 'Patna', 'Bihar', 'Bus stand', 25.5865, 85.1371),
  point('patna-air', 'Jay Prakash Narayan Airport', 'Patna', 'Patna', 'Bihar', 'Airport', 25.5913, 85.088),
  point('gaya', 'Gaya Bus Stand', 'Gaya', 'Gaya', 'Bihar', 'Bus stand', 24.7914, 85.0002),
  point('delhi', 'Kashmere Gate ISBT', 'New Delhi', 'Central Delhi', 'Delhi', 'Bus stand', 28.6675, 77.2273),
  point('delhi-station', 'New Delhi Railway Station', 'New Delhi', 'Central Delhi', 'Delhi', 'Railway station', 28.643, 77.2194),
  point('delhi-air', 'Indira Gandhi International Airport', 'New Delhi', 'South West Delhi', 'Delhi', 'Airport', 28.5562, 77.1),
  point('anand', 'Anand Vihar ISBT', 'New Delhi', 'East Delhi', 'Delhi', 'Bus stand', 28.6465, 77.3161),
  point('mumbai', 'Dadar Bus Station', 'Mumbai', 'Mumbai City', 'Maharashtra', 'Bus stand', 19.0184, 72.8438),
  point('mumbai-air', 'Chhatrapati Shivaji Maharaj Airport', 'Mumbai', 'Mumbai Suburban', 'Maharashtra', 'Airport', 19.0896, 72.8656),
  point('pune', 'Swargate Bus Stand', 'Pune', 'Pune', 'Maharashtra', 'Bus stand', 18.5007, 73.8584),
  point('bangalore', 'Kempegowda Bus Station', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', 'Bus stand', 12.9779, 77.5713),
  point('bangalore-air', 'Kempegowda International Airport', 'Bengaluru', 'Bengaluru Urban', 'Karnataka', 'Airport', 13.1986, 77.7066),
  point('mysuru', 'Mysuru City Bus Stand', 'Mysuru', 'Mysuru', 'Karnataka', 'Bus stand', 12.3065, 76.6554),
  point('kolkata', 'Esplanade Bus Terminus', 'Kolkata', 'Kolkata', 'West Bengal', 'Bus stand', 22.5647, 88.3515),
  point('howrah', 'Howrah Railway Station', 'Howrah', 'Howrah', 'West Bengal', 'Railway station', 22.5839, 88.3429),
  point('lucknow', 'Alambagh Bus Station', 'Lucknow', 'Lucknow', 'Uttar Pradesh', 'Bus stand', 26.8172, 80.9076),
  point('varanasi', 'Varanasi Cantt Station', 'Varanasi', 'Varanasi', 'Uttar Pradesh', 'Railway station', 25.3268, 82.986),
  point('agra', 'Idgah Bus Stand', 'Agra', 'Agra', 'Uttar Pradesh', 'Bus stand', 27.1606, 77.9972),
  point('jaipur', 'Sindhi Camp Bus Stand', 'Jaipur', 'Jaipur', 'Rajasthan', 'Bus stand', 26.9221, 75.8025),
  point('jodhpur', 'Jodhpur Bus Stand', 'Jodhpur', 'Jodhpur', 'Rajasthan', 'Bus stand', 26.2822, 73.0193),
  point('hyderabad', 'Mahatma Gandhi Bus Station', 'Hyderabad', 'Hyderabad', 'Telangana', 'Bus stand', 17.3773, 78.4805),
  point('hyderabad-air', 'Rajiv Gandhi International Airport', 'Hyderabad', 'Rangareddy', 'Telangana', 'Airport', 17.2403, 78.4294),
  point('chennai', 'Puratchi Thalaivar Dr. M.G.R. Bus Terminus', 'Chennai', 'Chennai', 'Tamil Nadu', 'Bus stand', 13.0674, 80.2066),
  point('chennai-central', 'Chennai Central Railway Station', 'Chennai', 'Chennai', 'Tamil Nadu', 'Railway station', 13.0827, 80.2757),
  point('ahmedabad', 'Geeta Mandir Bus Stand', 'Ahmedabad', 'Ahmedabad', 'Gujarat', 'Bus stand', 23.0143, 72.5912),
  point('surat', 'Surat Central Bus Station', 'Surat', 'Surat', 'Gujarat', 'Bus stand', 21.2049, 72.8397),
  point('bhopal', 'ISBT Bhopal', 'Bhopal', 'Bhopal', 'Madhya Pradesh', 'Bus stand', 23.2324, 77.4334),
  point('indore', 'Sarwate Bus Stand', 'Indore', 'Indore', 'Madhya Pradesh', 'Bus stand', 22.7185, 75.8655),
  point('kochi', 'Ernakulam KSRTC Bus Station', 'Kochi', 'Ernakulam', 'Kerala', 'Bus stand', 9.9737, 76.286),
  point('trivandrum', 'Thampanoor Bus Station', 'Thiruvananthapuram', 'Thiruvananthapuram', 'Kerala', 'Bus stand', 8.4891, 76.9536),
  point('chandigarh', 'ISBT Sector 43', 'Chandigarh', 'Chandigarh', 'Chandigarh', 'Bus stand', 30.716, 76.741),
  point('amritsar', 'Amritsar Bus Stand', 'Amritsar', 'Amritsar', 'Punjab', 'Bus stand', 31.633, 74.877),
  point('dehradun', 'ISBT Dehradun', 'Dehradun', 'Dehradun', 'Uttarakhand', 'Bus stand', 30.289, 78.022),
  point('guwahati', 'ISBT Guwahati', 'Guwahati', 'Kamrup Metropolitan', 'Assam', 'Bus stand', 26.113, 91.706),
  point('ranchi', 'Khadgarha Bus Stand', 'Ranchi', 'Ranchi', 'Jharkhand', 'Bus stand', 23.358, 85.334),
  point('bhubaneswar', 'Baramunda Bus Stand', 'Bhubaneswar', 'Khordha', 'Odisha', 'Bus stand', 20.266, 85.792),
  point('raipur', 'Pandri Bus Stand', 'Raipur', 'Raipur', 'Chhattisgarh', 'Bus stand', 21.251, 81.644),
  point('panaji', 'Panaji KTC Bus Stand', 'Panaji', 'North Goa', 'Goa', 'Bus stand', 15.498, 73.826),
  point('srinagar', 'Srinagar TRC Bus Stand', 'Srinagar', 'Srinagar', 'Jammu and Kashmir', 'Bus stand', 34.065, 74.846),
  point('puducherry', 'Puducherry Bus Stand', 'Puducherry', 'Puducherry', 'Puducherry', 'Bus stand', 11.924, 79.82),
];

export const buses: Bus[] = [
  { id:'b1', operator:'Nexora Travels', service:'NX 102', type:'AC Sleeper', departure:'20:30', arrival:'07:15', duration:'10h 45m', hours:10.75, fare:1299, seats:18, rating:4.8, boarding:'Main bus stand', dropping:'Central bus station', amenities:['Wi-Fi','Charging','Blanket'] },
  { id:'b2', operator:'Highway Lines', service:'HL 208', type:'AC Seater', departure:'07:00', arrival:'18:30', duration:'11h 30m', hours:11.5, fare:899, seats:12, rating:4.6, boarding:'City pickup point', dropping:'Main bus stand', amenities:['Charging','Water bottle'] },
  { id:'b3', operator:'Purple Mile', service:'PM 314', type:'AC Sleeper', departure:'22:15', arrival:'09:00', duration:'10h 45m', hours:10.75, fare:1499, seats:8, rating:4.9, boarding:'Central bus station', dropping:'Railway station', amenities:['Wi-Fi','Charging','Blanket'] },
  { id:'b4', operator:'Bharat Express', service:'BE 426', type:'Non-AC Seater', departure:'06:30', arrival:'19:15', duration:'12h 45m', hours:12.75, fare:649, seats:24, rating:4.3, boarding:'Main bus stand', dropping:'City pickup point', amenities:['Charging','Water bottle'] },
  { id:'b5', operator:'Orange Route', service:'OR 551', type:'Non-AC Sleeper', departure:'19:45', arrival:'08:15', duration:'12h 30m', hours:12.5, fare:999, seats:15, rating:4.5, boarding:'Railway station', dropping:'Central bus station', amenities:['Charging','Blanket'] },
];

export const popularRoutes: [string, string][] = [['Patna','New Delhi'],['Mumbai','Pune'],['Bengaluru','Chennai'],['Jaipur','New Delhi'],['Hyderabad','Bengaluru'],['Lucknow','Varanasi']];
export const todayISO = () => new Date().toLocaleDateString('en-CA');