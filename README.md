# Tripzo — Cloud-Based Bus Pass System

Tripzo is a web-based bus booking application designed to help users search for buses, manage bookings, and view booking details through a user-friendly interface.

## Live Demo

- **Frontend:** https://code-alpha-bus-pass-sys-xi.vercel.app
- **Backend API:** https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com
- **API Documentation:** https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com/docs

## Features

- Bus search and booking workflow
- Booking confirmation and booking details
- My Bookings page
- Booking cancellation
- Booking status verification after page refresh
- Responsive web interface
- REST API integration with the backend

*Note: Include only the features that are implemented and working in your deployed project.*

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- REST APIs

### Deployment
- Vercel — frontend hosting
- Render — backend hosting

## Project Structure

```text
Tripzo/
├── src/                 # Frontend source code
├── backend/
│   └── app/
│       └── main.py      # FastAPI application
├── public/              # Public frontend assets
├── .env.local           # Local environment configuration
├── .env.production      # Production environment configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Frontend dependencies and scripts
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/MohammadShadAlam/CodeAlpha_Cloud-Based-Bus-Pass-System.git
cd CodeAlpha_Cloud-Based-Bus-Pass-System
```

### 2. Set up the frontend

Install dependencies:

```bash
npm install
```

Create or configure `.env.local` in the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

### 3. Set up the backend

Open a separate terminal and navigate to the backend directory.

Install the dependencies listed in the backend's requirements file, then run the FastAPI application using the correct module path and configuration for this project.

For example, if the backend dependencies and application entry point match the standard FastAPI layout:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend API documentation is available locally at:

`http://127.0.0.1:8000/docs`

## Production Configuration

The deployed frontend uses the production API base URL:

```env
VITE_API_BASE_URL=https://codealpha-cloud-based-bus-pass-system-k9ih.onrender.com
```

Keep local and production configuration separate. Do not commit passwords, private API keys, or other secrets to GitHub.

## Testing

The following checks were performed on the deployed application:

- Backend health endpoint returned `{"status":"healthy"}`.
- A test booking was created and checked after refreshing the page.
- Booking cancellation completed successfully.
- The booking status remained correct after refreshing the page.
- The frontend production build completed successfully using `npm run build`.

These checks confirm the observed results; database-level persistence should be verified separately if required.

## Deployment

- Frontend deployment: Vercel
- Backend deployment: Render

## Internship Project

This project was developed as part of the **CodeAlpha Cloud Computing Internship**.

## Author

**Mohammad Shad Alam**

GitHub: https://github.com/MohammadShadAlam

---

*Tripzo — Making bus booking simpler through a web-based application.*
