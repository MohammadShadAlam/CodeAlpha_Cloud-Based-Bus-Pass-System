# Tripzo - India bus booking demo

A frontend-only, map-first bus booking prototype built with React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, React Leaflet and Leaflet.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To verify a production bundle, use `npm run build`.

## What to try

- Search curated sample pickup points by name, city, state / union territory or district. All 36 states and union territories are listed; detailed points are a **sample subset**, not complete India-wide coverage.
- Pan and zoom the OpenStreetMap map, use device location with permission, click the map to set an approximate point, and preview a straight-line route.
- Filter mock buses, choose seats, enter passenger details, apply demo code `TRIPZO10`, and confirm a **demo-only** booking.
- View, cancel, print or download a booking summary. Bookings, recent locations and display name are saved to browser localStorage.

Bus operators, schedules, fares, available seats and routes are illustrative. Map lines are approximate, not road routing. No backend, real availability, GPS tracking, payment processing, or valid ticket issuance is included. OpenStreetMap tiles require an internet connection and retain their required attribution on the map.

## Structure

`src/components/` contains reusable map, location, search, bus and booking UI. `src/pages/` contains screens. `src/layouts/` provides shared navigation. `src/data/` contains the replaceable mock datasets. `src/hooks/` stores shared frontend state. `src/types/` defines models and `src/utils/` contains booking summary actions.
## Merged build notes

This project is the Tripzo sample with the best parts of the Roam sample merged in.

- **Profile** (`src/pages/ProfilePage.tsx`, `src/hooks/useProfile.ts`): personal details with validation, saved passengers, booking history, preferences. Stored in `localStorage` only. Saved details pre-fill the booking form and saved passengers can be quick-filled.
- **Map** (`src/components/InteractiveMap.tsx`, `src/data/indiaMap.ts`): opens fitted to India, bounded to South Asia, zoom from country to street level, pickup/drop pins with labels and popups, approximate route line, Pin pickup / Pin drop mode and a Map guide.
- **Tiles**: `mapTiles` in `src/data/indiaMap.ts` is the single swap point. The public OpenStreetMap tiles are for demos only; use a keyed provider in production. State/UT boundaries come from the tiles.
- **Readability**: low-contrast text colours were darkened to AA contrast and the smallest labels enlarged.
- **Background**: a very soft off-white to light-lavender gradient on `.app-shell` (end of `src/index.css`). Background only: no component changed.
