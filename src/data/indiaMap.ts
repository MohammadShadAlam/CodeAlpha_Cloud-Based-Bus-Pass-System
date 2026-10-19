import type { LatLngBoundsLiteral, LatLngTuple } from 'leaflet';

// India-first map configuration. Boundaries and labels for states/UTs come from the basemap tiles as the user zooms in.
// Bounds cover the mainland, Andaman & Nicobar, Lakshadweep, Ladakh and the north-east.
export const INDIA_BOUNDS: LatLngBoundsLiteral = [[6.2, 68.0], [37.2, 97.6]];
export const INDIA_CENTER: LatLngTuple = [22.9, 79.9];
// Soft panning limit: keeps the view in South Asia so the map never drifts to a world view.
export const INDIA_MAX_BOUNDS: LatLngBoundsLiteral = [[-2, 55], [44, 110]];
export const INDIA_MIN_ZOOM = 3.5;

// Single swap point for the tile provider. OpenStreetMap's public tiles need no key but are for light/demo use only;
// use a keyed provider (MapTiler, Stadia, Mapbox or your own tile server) in production.
export const mapTiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
