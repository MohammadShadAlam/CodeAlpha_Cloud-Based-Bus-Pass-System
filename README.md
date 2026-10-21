# Tripzo — Cloud-Based Bus Pass System

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)

A full-stack, cloud-deployed bus booking web application built as part of the **CodeAlpha Cloud Computing Internship**.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Project Objectives](#project-objectives)
4. [Key Features](#key-features)
5. [Real-Life Use Case](#real-life-use-case)
6. [Technology Stack](#technology-stack)
7. [System Architecture](#system-architecture)
8. [Application Workflow](#application-workflow)
9. [Project Structure](#project-structure)
10. [Prerequisites](#prerequisites)
11. [Installation and Setup](#installation-and-setup)
12. [Environment Variables](#environment-variables)
13. [Running the Frontend Locally](#running-the-frontend-locally)
14. [Running the Backend Locally](#running-the-backend-locally)
15. [API Endpoints](#api-endpoints)
16. [API Testing](#api-testing)
17. [Deployment Information](#deployment-information)
18. [Testing and Validation](#testing-and-validation)
19. [Limitations and Future Improvements](#limitations-and-future-improvements)
20. [Learning Outcomes](#learning-outcomes)
21. [Screenshots and Demo](#screenshots-and-demo)
22. [Live Demo](#live-demo)
23. [GitHub Repository](#github-repository)
24. [Acknowledgements](#acknowledgements)

## Project Overview

Tripzo is a map-first bus booking web application for journeys across India. Users can register, sign in, browse buses, check which seats are taken for a chosen journey date, book one or more seats, review their bookings and cancel them.

The frontend is a React + TypeScript single-page application hosted on Vercel. It communicates over REST with a FastAPI backend hosted on Render, which stores data in PostgreSQL through SQLAlchemy.

## Problem Statement

Planning a bus trip often involves several small frustrations: not knowing which seats are still free on a given date, coordinating seats for more than one traveller, and having no single place to review or cancel a booking afterwards.

Tripzo is a learning project that explores how a cloud-hosted web application can address this workflow end to end, from seat selection to booking management.

## Project Objectives

- Build a full-stack web application with a clearly separated frontend and backend.
- Design and document a REST API using FastAPI.
- Deploy the frontend and backend to separate cloud platforms and connect them securely.
- Implement a booking workflow with seat-conflict handling.
- Practise environment-based configuration, API testing and deployment troubleshooting.

## Key Features

The features below are implemented in the backend API. UI behaviour should be checked against the live demo.

| Area | Capability |
| --- | --- |
| Accounts | Registration and login; passwords are stored hashed; 30-minute bearer access tokens (JWT) |
| Profile | View and update name, email and phone |
| Saved passengers | Add, list and delete saved passenger details |
| Buses | List buses with operator, route, departure/arrival time, seat count and fare |
| Seat availability | View occupied seats for a bus on a specific journey date |
| Booking | Book 1–10 seats in one request; duplicate or already-booked seats are rejected (HTTP 409) |
| My Bookings | List the signed-in user's bookings with route, seats, status and total fare |
| Cancellation | Cancel a booking, which releases its seats |
| Access control | Users can only view or cancel their own bookings |
| Documentation | Interactive Swagger UI at `/docs` |

## Real-Life Use Case

A student wants to travel home for the weekend with a friend. They sign in, choose a bus and journey date, check which seats are already occupied, select two seats and confirm the booking. If plans change, they open **My Bookings** and cancel, and the seats become available again for that date.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Leaflet / React-Leaflet |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Data layer | SQLAlchemy, PostgreSQL (`psycopg` driver) |
| Security | PyJWT (bearer tokens), `pwdlib` (password hashing) |
| API style | REST (JSON) |
| Hosting | Vercel (frontend), Render (backend) |

## System Architecture

```mermaid
flowchart LR
    U[User's Browser] --> F[React + TypeScript SPA<br/>Vercel]
    F -- REST / JSON<br/>VITE_API_BASE_URL --> B[FastAPI Backend<br/>Render]
    B -- SQLAlchemy --> D[(PostgreSQL)]
```

- The frontend is built with Vite and served as static files by Vercel.
- The browser calls the backend directly using the base URL baked into the frontend build.
- The backend allows requests only from an explicit list of origins (CORS), including the deployed Vercel URL and local development ports.
- Protected endpoints require an `Authorization: Bearer <token>` header.

> **To verify:** where the production PostgreSQL database is hosted. The code references Neon; confirm in your Render environment settings.

## Application Workflow

1. The user registers (`POST /register`) and logs in (`POST /login`) to receive an access token.
2. The frontend loads buses (`GET /buses`).
3. For a chosen bus and date, the frontend loads occupied seats (`GET /buses/{bus_id}/occupied-seats`).
4. The user selects seats and confirms (`POST /bookings`). The backend locks the bus row, checks seat availability and creates the booking with its seats.
5. If a seat was taken in the meantime, the API responds with `409` and the occupied seat numbers.
6. The user reviews bookings (`GET /bookings/{user_id}`) and can cancel one (`PATCH /bookings/{booking_id}/cancel`), which marks the booking cancelled and releases its seats.

## Project Structure

Verified from the repository:

```text
CodeAlpha_Cloud-Based-Bus-Pass-System/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes, auth, CORS
│   │   ├── database.py      # Settings (DATABASE_URL), engine, session
│   │   └── models.py        # User, Bus, Booking, BookingSeat, SavedPassenger
│   └── requirements.txt     # Backend dependencies
├── public/                  # Static frontend assets
├── src/                     # Frontend source (React + TypeScript)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> **To verify:** the internal layout of `src/` (components, pages, API helpers) and whether `.env.local` / `.env.production` are committed. Do not commit secrets.

## Prerequisites

- **Git**
- **Node.js** 20.19+ or 22.12+ (required by Vite 7) and npm
- **Python** 3.10 or newer (the code uses `X | None` type syntax)
- A **PostgreSQL** database and its connection URL (for example, a free hosted instance)
- Windows PowerShell or Command Prompt (instructions below are Windows-friendly)

## Installation and Setup

```powershell
git clone https://github.com/MohammadShadAlam/CodeAlpha_Cloud-Based-Bus-Pass-System.git
cd CodeAlpha_Cloud-Based-Bus-Pass-System
```

Then set up the [backend](#running-the-backend-locally) and [frontend](#running-the-frontend-locally) in two separate terminals.

## Environment Variables

### Frontend

| Variable | Local development | Production (Vercel) |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | `https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com` |

Create `.env.local` in the project root for local work:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Production builds use the Render URL, set through `.env.production` or the Vercel project's environment variable settings. Use the value without a trailing slash.

> **Important:** variables prefixed with `VITE_` are embedded into the client-side JavaScript bundle at build time and are visible to anyone who opens the site. **Never put secrets, passwords, database URLs or private keys in a `VITE_` variable.** Because values are baked in at build time, changing one requires a rebuild and redeploy.

### Backend

Create `backend/.env` (never commit this file):

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL. A `postgresql://` prefix is automatically converted to `postgresql+psycopg://`. |
| `SECRET_KEY` | Yes | Secret used to sign JWT access tokens. The app refuses to start without it. |

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME
SECRET_KEY=replace-with-a-long-random-value
```

Generate a key:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

On Render, set the same two variables in the service's **Environment** settings instead of using a file.

## Running the Frontend Locally

```powershell
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. This origin is allowed by the backend's CORS configuration (ports 5173 and 5174 are included).

Other scripts:

```powershell
npm run build     # production build
npm run preview   # preview the production build
```

## Running the Backend Locally

Run these from the `backend` folder, because the app imports `from app import ...`.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use `.venv\Scripts\activate.bat` in Command Prompt.

Create `backend/.env` (see above), then start the server:

```powershell
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`; Swagger UI is at `http://127.0.0.1:8000/docs`.

**First run on an empty database:** create the tables once by calling the setup endpoint, for example from Swagger UI (`POST /setup-database` → *Try it out* → *Execute*).

> **To verify:** how the `buses` table is populated (seed script, SQL file or manual insert). No bus-creation endpoint exists in the API, so document your seeding step here.

## API Endpoints

Base URL (production): `https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | No | Welcome message and status |
| GET | `/health` | No | Health check, returns `{"status":"healthy"}` |
| POST | `/setup-database` | No | Creates missing tables (does not migrate existing columns) |
| GET | `/buses` | No | List buses |
| GET | `/buses/{bus_id}/occupied-seats?journey_date=YYYY-MM-DD` | No | Occupied seat numbers for a bus and date |
| POST | `/register` | No | Create an account |
| POST | `/login` | No | Returns a bearer access token |
| GET | `/me` | Bearer | Current user's profile |
| PATCH | `/me` | Bearer | Update profile fields |
| GET | `/saved-passengers` | Bearer | List saved passengers |
| POST | `/saved-passengers` | Bearer | Add a saved passenger |
| DELETE | `/saved-passengers/{passenger_id}` | Bearer | Delete a saved passenger |
| POST | `/bookings` | Bearer | Create a booking (`bus_id`, `journey_date`, `seat_numbers`) |
| GET | `/bookings/{user_id}` | Bearer | List own bookings (`403` for other users) |
| PATCH | `/bookings/{booking_id}/cancel` | Bearer | Cancel own booking |

Full interactive documentation: <https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com/docs>

## API Testing

**Health check (PowerShell):**

```powershell
Invoke-RestMethod https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com/health
# Expected: status = healthy
```

For a local server, replace the base URL with `http://127.0.0.1:8000`.

**Swagger UI:** open `/docs`, use *Try it out* on any endpoint. For protected endpoints, call `/login`, copy the `access_token`, click **Authorize** and paste the token.

**Example register → login → book flow (PowerShell):**

```powershell
$base = "http://127.0.0.1:8000"

Invoke-RestMethod -Method Post "$base/register" -ContentType "application/json" -Body (@{
  full_name="Test User"; email="test@example.com"; phone="9876543210"; password="StrongPass123"
} | ConvertTo-Json)

$login = Invoke-RestMethod -Method Post "$base/login" -ContentType "application/json" -Body (@{
  email="test@example.com"; password="StrongPass123"
} | ConvertTo-Json)

$headers = @{ Authorization = "Bearer $($login.access_token)" }

Invoke-RestMethod -Method Post "$base/bookings" -Headers $headers -ContentType "application/json" -Body (@{
  bus_id=1; journey_date="2026-12-01"; seat_numbers=@(1,2)
} | ConvertTo-Json)
```

Use a `bus_id` that exists in your database.

## Deployment Information

| Component | Platform | Notes |
| --- | --- | --- |
| Frontend | Vercel | Build command `npm run build`; set `VITE_API_BASE_URL` to the Render URL |
| Backend | Render | Python web service running FastAPI with Uvicorn; set `DATABASE_URL` and `SECRET_KEY` |
| Database | PostgreSQL | Hosting provider to be confirmed (see architecture note) |

> **To verify:** the exact Render build and start commands (typically `pip install -r requirements.txt` and `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, with the root directory set to `backend`) and whether the Vercel project needs a rewrite rule so direct visits to client-side routes work after a refresh.

If the backend is hosted on a tier that sleeps when idle, the first request after inactivity may be slow.

## Testing and Validation

Manual checks performed on the deployed application:

- Backend health endpoint returns `{"status":"healthy"}`.
- A test booking was created and its status checked after refreshing the page.
- A booking was cancelled and its status remained correct after refresh.
- The frontend production build completes with `npm run build`.
- Backend routes were exercised through the Swagger UI.

The repository does not currently include automated unit or integration tests.

## Limitations and Future Improvements

**Current scope**

- Payments, ticket delivery (email/SMS) and live bus tracking are not part of this project.
- Bus records are managed directly in the database; there is no admin interface or bus-creation endpoint.
- Access tokens last 30 minutes and there is no refresh-token or password-reset flow.
- `POST /setup-database` is a convenience endpoint for initial setup and should be protected or disabled in production.
- Tables are created with `create_all`, which does not migrate existing columns.
- CORS allows a fixed list of origins, so a new frontend domain must be added to the backend.

**Possible next steps**

- Add database migrations (for example, Alembic) and automated tests.
- Add an admin area for managing buses and schedules.
- Add password reset, refresh tokens and email notifications.
- Add payment integration and downloadable tickets.
- Add CI to build and test on every push.

## Learning Outcomes

- Building a typed React frontend and a FastAPI backend that communicate over REST.
- Configuring environments for local and production, and understanding that `VITE_` variables are public.
- Handling CORS and authentication between independently deployed services.
- Designing booking logic that prevents double-booking with row locking and conflict responses.
- Testing APIs through health checks and Swagger, then validating the full booking workflow end to end.

## Screenshots and Demo

> Replace the placeholders below with real images stored in a `docs/screenshots/` folder.

| Home / Search | Seat Selection |
| --- | --- |
| ![Home](docs/screenshots/home.png) | ![Seat selection](docs/screenshots/seat-selection.png) |

| Booking Confirmation | My Bookings |
| --- | --- |
| ![Confirmation](docs/screenshots/confirmation.png) | ![My bookings](docs/screenshots/my-bookings.png) |

Demo video: _add link here_

## Live Demo

- **Frontend:** <https://code-alpha-cloud-based-bus-pass-sys-xi.vercel.app/>
- **Backend API:** <https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com>
- **API documentation:** <https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com/docs>

## GitHub Repository

<https://github.com/MohammadShadAlam/CodeAlpha_Cloud-Based-Bus-Pass-System>

## Acknowledgements

Built as part of the **CodeAlpha Cloud Computing Internship**. Thanks to CodeAlpha for the opportunity and guidance.

**Author:** Mohammad Shad Alam, [GitHub](https://github.com/MohammadShadAlam)