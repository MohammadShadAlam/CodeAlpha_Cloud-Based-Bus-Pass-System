import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types';
import { getApproximateRoute } from '../utils/route';
import { INDIA_BOUNDS, INDIA_MAX_BOUNDS, INDIA_MIN_ZOOM, mapTiles } from '../data/indiaMap';

const markerIcon = (kind: 'pickup' | 'drop') => L.divIcon({ className: 'custom-map-marker', html: `<div class="pin ${kind}"><span>${kind === 'pickup' ? 'A' : 'B'}</span></div>`, iconSize: [38, 48], iconAnchor: [19, 44] });

export type MapSelection = 'pickup' | 'drop' | null;

function MapController({ pickup, drop, focus, selecting }: { pickup: Location | null; drop: Location | null; focus: number; selecting: MapSelection }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (pickup && drop) map.fitBounds(L.latLngBounds(getApproximateRoute(pickup, drop)), { padding: [80, 80], maxZoom: 11 });
      else if (pickup || drop) map.flyTo([(pickup || drop)!.lat, (pickup || drop)!.lng], 9, { duration: 0.8 });
      else map.fitBounds(INDIA_BOUNDS, { padding: [20, 20], maxZoom: 6 }); // default: all of India
    }, 150);
    return () => window.clearTimeout(timer);
  }, [map, pickup, drop, focus]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => { map.getContainer().classList.toggle('map-selecting', !!selecting); }, [map, selecting]);
  return null;
}

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

const Popover = ({ title, place }: { title: string; place: Location }) => <Popup><div className="map-place-popup"><small>{title}</small><strong>{place.name}</strong><p>{place.city}{place.state ? `, ${place.state}` : ''}</p><span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span></div></Popup>;

export default function InteractiveMap({ pickup, drop, focus, onPick, selecting = null }: { pickup: Location | null; drop: Location | null; focus: number; onPick: (lat: number, lng: number) => void; selecting?: MapSelection }) {
  const route = pickup && drop ? getApproximateRoute(pickup, drop) : null;
  return <MapContainer bounds={INDIA_BOUNDS} boundsOptions={{ padding: [20, 20] }} maxBounds={INDIA_MAX_BOUNDS} maxBoundsViscosity={0.85} minZoom={INDIA_MIN_ZOOM} maxZoom={18} zoomSnap={0.5} zoomControl={false} scrollWheelZoom className="leaflet-map">
    <TileLayer attribution={mapTiles.attribution} url={mapTiles.url} />
    <ZoomControl position="bottomright" />
    <MapController pickup={pickup} drop={drop} focus={focus} selecting={selecting} />
    <ClickPicker onPick={onPick} />
    {route && <><Polyline positions={route} pathOptions={{ color: '#fff', weight: 10, opacity: .9, lineCap: 'round', lineJoin: 'round' }} /><Polyline positions={route} pathOptions={{ color: '#4b2b84', weight: 5, lineCap: 'round', lineJoin: 'round' }} /></>}
    {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={markerIcon('pickup')}><Tooltip direction="top" offset={[0, -44]} permanent className="place-map-label"><small>PICKUP</small><strong>{pickup.city}</strong></Tooltip><Popover title="PICKUP LOCATION" place={pickup} /></Marker>}
    {drop && <Marker position={[drop.lat, drop.lng]} icon={markerIcon('drop')}><Tooltip direction="top" offset={[0, -44]} permanent className="place-map-label"><small>DROP</small><strong>{drop.city}</strong></Tooltip><Popover title="DROP LOCATION" place={drop} /></Marker>}
  </MapContainer>;
}
