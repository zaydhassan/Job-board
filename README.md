# Job Board Fullstack App

A modern job board application featuring a Next.js (`client/`) frontend, Express/MongoDB backend (`server/`), real-time updates via Socket.IO, and queue-based processing with BullMQ and Redis.

---

## Features

- **Frontend:** Next.js (in `/client`) for fast, SEO-friendly, and modern UI.
- **Backend:** Express API (`server/src/app.js`) with MongoDB database and BullMQ job queues.
- **Real-Time:** Socket.IO for real-time job status and progress updates.
- **Single Domain Deploy:** Both frontend (as static assets) and backend served from the same URL (Render/Web Service).

---

## Project Structure

/
├── client/ # Next.js app

│ └── src/
│ └── app # App directory or main entrypoints
├── server/ # Express.js backend & API
│ └── src/
│ └── app.js # Backend entrypoint for server
├── README.md
├── package.json
└── ...other root files

---

## Setup & Local Development

**1. Clone and install dependencies**

git clone <repo-url>

cd<repo-directory>

npm install --prefix client

npm install


**2. Create `.env` files for development**

- `server/.env` (example):

MONGODB_URI=mongodb+srv://...

REDIS_URL=redis://...

PORT=5000

- `client/.env.local` as needed for frontend config.

**3. Start in development mode**

- Start backend:

npm run dev --prefix server

- Start frontend:

npm run dev --prefix client
