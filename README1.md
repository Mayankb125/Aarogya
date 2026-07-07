# 🏥 CliniQ — Smart Clinic Queue Management System

> **Category:** Full Stack Development
> **Developer:** Mayank Bansal — mayankbansal190@gmail.com

---

## 📌 The Problem

**76% of India's 1.5 million clinics still run on paper token slips and shouting.**

Walk into any neighbourhood clinic in India today — patients sit in rows with paper tokens, no idea when they'll be called, receptionists yell names across a crowded room, and doctors get zero context before a patient walks in. Patients wait 2–3 hours with no information. Receptionists manage everything from memory. Nobody wins.

This is a solvable problem. CliniQ solves it.

---

## 💡 The Solution

CliniQ is a **real-time, web-based clinic queue management system** that digitises the entire patient flow — from the moment a patient registers to the moment they are called into the doctor's room.

### How it works right now (Phase 1 — Hackathon Build)

1. Receptionist opens the dashboard on any device
2. Adds a patient — name and reason for visit
3. Sets average consultation time in minutes
4. Clicks **"Call Next"** — system assigns the next token and broadcasts it instantly
5. Patient opens the waiting room screen on their phone or a display TV
6. Sees in real time — current token being served, how many tokens are ahead, estimated wait time
7. Both screens sync instantly — no refresh, no polling, pure WebSocket

### The bigger vision (Phase 2 & 3 — Planned)

- **Patient self-registration:** Patients fill their own details from home before arriving — name, age, contact, reason for visit — so the receptionist never has to do manual entry
- **Medical history upload:** Upload past reports, prescriptions, and documents directly to their profile so the doctor sees it before calling them in
- **Pre-book appointments:** Book a slot in advance, get a QR code or booking ID
- **Auto-confirm on arrival:** Patient tells the receptionist their name → pre-filled details auto-populate → appointment confirmed in one click
- **WhatsApp / SMS alerts:** Notify patients when 2–3 tokens away so they don't have to stare at a screen
- **Doctor's view:** Doctor gets a quick summary of the patient's uploaded history before calling them in
- **Admin panel:** Clinic owner sees analytics — average wait times, peak hours, busiest days, total patients served
- **Missed token auto-skip:** If a token is skipped twice, it moves to the end of the queue automatically
- **Multi-clinic support:** One platform for hospital chains with multiple branches
- **Mobile app:** React Native version for patients to track their token from anywhere

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | UI framework — builds the Receptionist and Patient screens |
| React Router | Handles `/receptionist` and `/waiting` routes |
| socket.io-client | Connects to the backend and listens for live queue events |
| Tailwind CSS | Utility-first styling — fast and clean UI |
| Vite | Lightning-fast React build tool |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the server |
| Express.js | REST API framework — handles HTTP routes |
| Socket.IO | WebSocket server — broadcasts real-time queue events to all clients |
| Firebase Admin SDK | Reads and writes queue data in Firestore from the server |

### Database

| Technology | Purpose |
|---|---|
| Firebase Firestore | Real-time NoSQL database — stores queue state, patient tokens, wait time data |
| Firebase Auth | (Phase 2) Patient and receptionist login |
| Firebase Storage | (Phase 2) Patient medical report uploads |

### Why Firebase over SQLite or MongoDB?

Firebase Firestore has built-in real-time document listeners — when a queue document changes, every listening client gets notified automatically. This pairs naturally with Socket.IO. It also has a generous free Spark plan, zero server setup, and scales automatically. For a 2-week hackathon, this is the smart pragmatic choice.

### Why keep Socket.IO if Firebase already has real-time?

The hackathon requires a **socket event diagram** as a mandatory submission — meaning the judges expect to see WebSocket knowledge demonstrated. Socket.IO also gives precise control over which events fire, when, and to whom. Firebase handles **persistence**, Socket.IO handles the **live push layer**. They work together, not against each other.

### Deployment

| Service | What it hosts | Why |
|---|---|---|
| Vercel | React frontend | One-command deploys, free tier, perfect for React |
| Railway | Node.js backend | Free tier, supports WebSockets (Vercel does NOT support WebSockets) |
| Firebase | Firestore database + Auth + Storage | Managed, free tier, no server to maintain |
| GitHub | Source code + README | Version control + required hackathon submission |

---

## 📁 Folder Structure

This structure is designed to scale. Today we build `receptionist/` and `patient/`. Tomorrow we just fill in `admin/` and `doctor/` — nothing else changes.

```
queue-cure-26/
│
├── backend/                              # Node.js + Express + Socket.IO server
│   ├── config/
│   │   └── firebase.js                  # Firebase Admin SDK initialisation
│   ├── routes/
│   │   ├── queue.js                     # REST routes: add patient, call next, reset
│   │   └── admin.js                     # (Phase 2) Admin analytics routes
│   ├── sockets/
│   │   ├── socketManager.js             # Socket.IO server setup and connection handler
│   │   └── queueEvents.js               # All socket event listeners and emitters
│   ├── services/
│   │   ├── queueService.js              # Queue business logic (add, next, reset)
│   │   └── adminService.js              # (Phase 2) Analytics business logic
│   ├── middleware/
│   │   └── errorHandler.js              # Global error handling middleware
│   ├── .env                             # PORT, FIREBASE_SERVICE_ACCOUNT, CLIENT_URL
│   ├── server.js                        # Entry point — creates HTTP server + attaches Socket.IO
│   └── package.json
│
├── frontend/                            # React app — split by user role
│   ├── src/
│   │   │
│   │   ├── receptionist/                # Everything the receptionist sees
│   │   │   ├── ReceptionistPage.jsx     # Main page — route: /receptionist
│   │   │   ├── Dashboard.jsx            # Full dashboard layout
│   │   │   ├── AddPatientForm.jsx       # Form to register a new patient
│   │   │   ├── QueueList.jsx            # Live list of all patients in queue
│   │   │   └── CallNextButton.jsx       # Triggers next token call
│   │   │
│   │   ├── patient/                     # Everything the patient sees
│   │   │   ├── WaitingRoomPage.jsx      # Main page — route: /waiting
│   │   │   ├── CurrentToken.jsx         # Token currently being served
│   │   │   ├── TokensAhead.jsx          # How many tokens before patient
│   │   │   └── WaitTimeDisplay.jsx      # Estimated wait in minutes
│   │   │
│   │   ├── admin/                       # (Phase 2) Clinic admin panel
│   │   │   ├── AdminPage.jsx            # Route: /admin
│   │   │   ├── AnalyticsDashboard.jsx   # Wait time trends, peak hours
│   │   │   └── ClinicSettings.jsx       # Set avg consultation time, clinic name
│   │   │
│   │   ├── shared/                      # Shared across all 3 apps — write once, use everywhere
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSocket.js         # Custom hook: connects to Socket.IO, manages events
│   │   │   │   └── useQueue.js          # Custom hook: queue state management
│   │   │   ├── services/
│   │   │   │   ├── firebase.js          # Firebase web SDK init + Firestore config
│   │   │   │   ├── queueService.js      # Firestore read/write functions
│   │   │   │   └── socketService.js     # Socket.IO event emitter functions
│   │   │   └── utils/
│   │   │       └── waitTimeCalculator.js  # tokensAhead × avgConsultTime
│   │   │
│   │   ├── App.jsx                      # React Router — maps routes to pages
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Tailwind base styles
│   │
│   ├── .env                             # VITE_SOCKET_URL, VITE_FIREBASE_CONFIG
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/                                # Required hackathon submission documents
│   ├── socket-event-diagram.png         # Visual map of all Socket.IO events
│   └── thought-process-sheet.pdf        # Concurrency, edge cases, architecture decisions
│
├── .gitignore
└── README.md                            # This file
```

### Why split frontend by role, not by type?

Most beginners split by type: `pages/`, `components/`, `hooks/`. This works small but breaks when you add features. If you need to touch the admin panel, your files are scattered across 5 folders.

Splitting by role means **all receptionist files are in `receptionist/`**, all patient files are in `patient/`, all admin files are in `admin/`. When you build Phase 2, you open one folder and work. When you fix a bug in the waiting screen, you know exactly where to look. The `shared/` folder holds everything that is used by more than one app — hooks, Firebase config, utilities.

---

## 🔌 Socket Event Reference

This is the complete map of all Socket.IO events in the system. This also fulfils the **socket event diagram** submission requirement.

```
CLIENT (Receptionist)            SERVER                     CLIENT (All patients)
        |                           |                               |
        |--- patient:add ---------->|                               |
        |    { name, reason }       |-- writes to Firestore         |
        |                           |-- emit: queue:updated ------->|
        |                           |   { queue[], currentToken,    |
        |                           |     tokensAhead, waitTime }   |
        |                           |                               |
        |--- token:callNext ------->|                               |
        |                           |-- updates Firestore           |
        |                           |-- emit: token:called -------->|
        |                           |   { currentToken, queue[] }   |
        |                           |                               |
        |--- queue:reset ---------->|                               |
        |                           |-- clears Firestore            |
        |                           |-- emit: queue:cleared ------->|
        |                           |                               |
        |--- queue:sync ----------->|  (fired on connect)           |
        |<-- queue:state -----------|                               |
        |    { queue[], current }   |                               |
        |                           |                               |
        |<-- error:emptyQueue ------|  (only to receptionist)       |
        |<-- error:duplicate -------|  (only to receptionist)       |
```

### Event table

| Event | Direction | Payload | Description |
|---|---|---|---|
| `patient:add` | Client → Server | `{ name, reason, avgConsultTime }` | Receptionist adds a new patient |
| `token:callNext` | Client → Server | `{}` | Receptionist calls the next token |
| `queue:reset` | Client → Server | `{}` | Resets the entire queue |
| `queue:sync` | Client → Server | `{}` | Fired on connect to get current snapshot |
| `queue:updated` | Server → All | `{ queue[], currentToken, waitTime }` | Broadcast after any queue change |
| `token:called` | Server → All | `{ currentToken, queue[] }` | Broadcast when next token is called |
| `queue:cleared` | Server → All | `{}` | Broadcast after queue reset |
| `queue:state` | Server → Requester | `{ queue[], currentToken }` | Sends full state to newly connected client |
| `error:emptyQueue` | Server → Receptionist | `{ message }` | Fires if call next is clicked on empty queue |
| `error:duplicate` | Server → Receptionist | `{ message }` | Fires if duplicate token is attempted |

---

## ⚙️ Wait Time Calculation

Wait time is **never hardcoded**. It is computed dynamically on every queue change:

```js
// shared/utils/waitTimeCalculator.js

/**
 * @param {number} tokensAhead     - Number of patients ahead in queue
 * @param {number} avgConsultTime  - Average consultation time in minutes (set by receptionist)
 * @returns {number}               - Estimated wait time in minutes
 */
export function calculateWaitTime(tokensAhead, avgConsultTime) {
  if (tokensAhead <= 0) return 0;
  return tokensAhead * avgConsultTime;
}
```

When the receptionist updates `avgConsultTime`, the new value is broadcast immediately via `queue:updated` and all patient screens recalculate in real time. No page refresh, no stale estimates.

---

## 🧠 Thought Process — Concurrency & Edge Cases

### Race condition: Two receptionists click "Call Next" at the same time

This is the classic concurrent write problem. Our solution uses **Firestore transactions** on the backend. A transaction reads and writes atomically — if two requests arrive simultaneously, one succeeds and the other retries with the updated state. The server only emits `token:called` after the transaction commits, so clients never see duplicate or conflicting state.

### Patient disconnects and reconnects mid-session

On every new socket connection, the client fires `queue:sync`. The server responds with `queue:state` — a full snapshot of the current queue. The client rebuilds its UI from this snapshot. No stale state, no missed updates.

### Receptionist clicks "Call Next" on an empty queue

The server checks `queue.length > 0` before processing `token:callNext`. If the queue is empty, it emits `error:emptyQueue` back to that receptionist only — not broadcast to patients. The UI shows a friendly alert. Nothing breaks.

### Network drops mid-session

Socket.IO has built-in reconnection logic with exponential backoff. On reconnect, the client fires `queue:sync` and gets a fresh state. Firestore is the single source of truth — even if the server restarts, the full queue state is recovered from Firestore on boot.

### Two patients with the same name

Patients are identified by **auto-generated token number**, not by name. Token numbers are assigned sequentially and stored in Firestore as the primary key. Same name is not a problem.

### Average consultation time changes mid-session

If the receptionist updates `avgConsultTime`, the new value is immediately broadcast to all clients via `queue:updated`. Every patient screen recalculates their estimated wait using the new value in real time.

### What happens when a patient no-shows?

The receptionist can skip a token. If a token is skipped twice (Phase 2 feature), the system auto-moves it to the end of the queue. For the current build, manual skip via the dashboard is supported.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Firebase project (free Spark plan is sufficient)
- Railway account (free tier)
- Vercel account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/queue-cure-26.git
cd queue-cure-26
```

### 2. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → enable **Cloud Firestore** in test mode
3. Project Settings → Service Accounts → **Generate new private key**
4. Save the downloaded JSON as `backend/serviceAccountKey.json`
5. Project Settings → General → copy your **Firebase web config** for the frontend

### 3. Configure environment variables

**Backend** (`backend/.env`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
```

**Frontend** (`frontend/.env`):
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Run locally

```bash
# Terminal 1 — start backend
cd backend && npm run dev

# Terminal 2 — start frontend
cd frontend && npm run dev
```

Then open:
- Receptionist view → `http://localhost:5173/receptionist`
- Patient waiting room → `http://localhost:5173/waiting`
- Admin panel (Phase 2) → `http://localhost:5173/admin`

---

## 📦 Deployment

### Backend → Railway

```bash
cd backend
railway login
railway init
railway up
```

Set these in the Railway dashboard under Variables:
- `PORT` → `5000`
- `CLIENT_URL` → your Vercel frontend URL
- `FIREBASE_SERVICE_ACCOUNT` → paste the full JSON content as a string

Copy your Railway deployment URL (e.g. `https://queue-cure.up.railway.app`).

### Frontend → Vercel

```bash
cd frontend
vercel login
vercel
```

Set these in the Vercel dashboard under Environment Variables:
- `VITE_SOCKET_URL` → your Railway backend URL
- All `VITE_FIREBASE_*` variables from your Firebase config

---

## 📊 Evaluation Criteria — How We Score

| Criteria | Weight | How we meet it |
|---|---|---|
| Live queue updates across both screens without refresh | 40% | Socket.IO emits `queue:updated` to all clients on every change — no polling, no refresh |
| Wait time computed from real data, not hardcoded | 25% | `tokensAhead × avgConsultTime` calculated live, recomputed on every queue change |
| Receptionist screen is fast and mistake-proof | 20% | Empty queue guard, duplicate token guard, validation on add patient form, instant feedback |
| Thought process addresses concurrency and edge cases | 15% | Firestore transactions for race conditions, reconnect sync, 6 edge cases documented above |

---

## 📋 Submission Checklist

- [ ] Working prototype link or demo video
- [ ] GitHub repository with README (this file)
- [ ] Socket event diagram (`docs/socket-event-diagram.png`)
- [ ] Thought process sheet (`docs/thought-process-sheet.pdf`)

---

## 🔮 Product Roadmap

| Feature | Phase | Status |
|---|---|---|
| Live queue — receptionist screen | Phase 1 | ✅ Building now |
| Live queue — patient waiting screen | Phase 1 | ✅ Building now |
| Socket.IO real-time sync | Phase 1 | ✅ Building now |
| Dynamic wait time calculation | Phase 1 | ✅ Building now |
| Patient self-registration from home | Phase 2 | Planned |
| Medical report and prescription upload | Phase 2 | Planned |
| Pre-book appointment + QR code check-in | Phase 2 | Planned |
| Auto-confirm on arrival (name lookup) | Phase 2 | Planned |
| WhatsApp / SMS alert when 2 tokens away | Phase 2 | Planned |
| Doctor's view — patient history before consult | Phase 2 | Planned |
| Missed token auto-skip logic | Phase 2 | Planned |
| Admin panel — clinic analytics dashboard | Phase 2 | Planned |
| Multi-clinic / hospital chain support | Phase 3 | Planned |
| Mobile app (React Native) | Phase 3 | Planned |

---

## 👤 Developer

**Mayank Bansal**
📧 mayankbansal190@gmail.com

---

> *"76% of India's clinics run on paper tokens. Not anymore."*

