# Cliniq — Full Product Brief
### From a queue management tool to India's smartest clinic discovery and booking platform

---

## The Idea in One Paragraph

Cliniq started as a live queue management system for clinics. Phase 2 turns it into something much bigger — a BookMyShow-style platform for healthcare. A patient has a symptom, opens Cliniq, searches for that symptom or disease, and instantly sees which hospitals and clinics near them have doctors for that condition, what their timings are, how many doctors are available today, what slots are open, and what other doctors they have for the same specialty. They pick a doctor, book a slot, get a QR code, arrive at the clinic, scan in, and enter the live queue system that Phase 1 already built. The booking is the entry point. The live queue experience is what makes Cliniq different from every other app out there.

---

## The Problem This Solves

Today when someone gets sick in India, their options are:

- Call the clinic and hope someone picks up
- Just show up and wait without knowing if the doctor is even available
- Use Practo or DocPrime which mostly covers big hospitals and established doctors — not the neighbourhood clinic with 3 doctors and 50 patients a day

None of these tell you: which nearby clinic has a doctor for my specific problem, are they available right now, and how long will I actually wait once I get there.

Cliniq answers all three questions in one app.

---

## What Makes Cliniq Different from Practo

| Feature | Practo | Cliniq |
|---|---|---|
| Find doctors near you | Yes | Yes |
| Book an appointment | Yes | Yes |
| Real-time queue after arrival | No — you arrive and still wait blindly | Yes — live token, tokens ahead, wait time |
| Works for small neighbourhood clinics | Poorly | Built specifically for this |
| Symptom to specialty mapping | Basic | Smart lookup — "fever" finds General Physicians |
| Patient medical history on file | Yes | Yes (Phase 2) |
| Doctor sees patient history before consult | No | Yes (Phase 2) |
| WhatsApp alert when your turn is near | No | Yes (Phase 2) |

The booking is just the entry point. The live queue experience after arrival is the product.

---

## The Full User Journey

### Step 1 — Search
Patient opens Cliniq. Types "fever and body ache" or just "skin rash" or "heart problem". Cliniq maps that symptom to the right specialty — General Physician, Dermatologist, Cardiologist. Patient sees a list of nearby hospitals and clinics that have a doctor for that specialty today.

### Step 2 — Browse hospitals
Patient sees hospital cards — clinic name, distance, how many doctors available today for their specialty, earliest available slot, average rating. They can filter by distance, rating, fee range, or availability.

### Step 3 — See all doctors at a hospital
Patient taps a hospital. Sees all doctors for their specialty at that hospital. Dr. Sharma available 10am–1pm, Dr. Mehta available 4pm–7pm, Dr. Kapoor not available today. Each doctor card shows photo, name, qualification, timing, slots left, fee, rating.

### Step 4 — Book a slot
Patient taps a doctor. Sees full profile — qualifications, experience, languages spoken, ratings from past patients. Below that a date picker for today and next 6 days. Below that a time slot grid — green slots are open, gray are booked, exactly like BookMyShow's seat selection but for appointment times. Patient taps a slot, confirms, gets a QR code booking confirmation.

### Step 5 — Arrive and check in
Patient arrives at clinic. Shows QR code or gives name. Receptionist scans or searches. System confirms their arrival and automatically adds them into the live queue at their booked position.

### Step 6 — Live queue (Phase 1 takes over)
From this point everything Phase 1 built handles it — live token display, tokens ahead, estimated wait time, real-time sync across all screens. Patient gets a WhatsApp or browser notification when 2 tokens away.

---

## The Symptom to Specialty Mapping

This is the intelligence layer that makes the search feel smart. Patient doesn't always know they need a Cardiologist — they just know their chest hurts.

```
Fever, cold, cough, body ache, headache          → General Physician
Chest pain, breathlessness, irregular heartbeat  → Cardiology
Skin rash, acne, hair fall, itching              → Dermatology
Knee pain, back pain, fracture, joint pain       → Orthopedics
Child fever, child nutrition, vaccination        → Pediatrics
Eye pain, blurry vision, redness                 → Ophthalmology
Tooth pain, gum bleeding, cavity                 → Dentistry
Anxiety, depression, sleep issues               → Psychiatry / Psychology
Stomach pain, acidity, indigestion              → Gastroenterology
Pregnancy, periods, PCOS                        → Gynecology
```

This starts as a simple lookup table. Later it becomes an AI-powered suggestion engine.

---

## Updated Folder Structure

The structure builds directly on Phase 1. Nothing from Phase 1 is deleted — it is extended.

```
cliniq/
│
├── backend/
│   ├── config/
│   │   └── firebase.js                        # existing — no change
│   │
│   ├── routes/
│   │   ├── queue.js                           # existing — no change
│   │   ├── admin.js                           # existing — extend with hospital onboarding
│   │   ├── hospitals.js                       # NEW — search, filter, get hospital details
│   │   ├── doctors.js                         # NEW — doctor profiles, availability, slots
│   │   ├── bookings.js                        # NEW — create booking, confirm arrival, cancel
│   │   ├── patients.js                        # NEW — patient profile, medical history
│   │   └── symptoms.js                        # NEW — symptom search, specialty mapping
│   │
│   ├── sockets/
│   │   ├── socketManager.js                   # existing — no change
│   │   └── queueEvents.js                     # existing — add booking:confirmed event
│   │
│   ├── services/
│   │   ├── queueService.js                    # existing — add auto-add from booking
│   │   ├── adminService.js                    # existing — no change
│   │   ├── hospitalService.js                 # NEW — hospital CRUD and search logic
│   │   ├── doctorService.js                   # NEW — slot generation, availability check
│   │   ├── bookingService.js                  # NEW — booking creation, QR generation
│   │   ├── patientService.js                  # NEW — profile and history management
│   │   └── symptomService.js                  # NEW — symptom to specialty lookup
│   │
│   ├── middleware/
│   │   ├── errorHandler.js                    # existing — no change
│   │   └── auth.js                            # NEW — Firebase Auth middleware for all roles
│   │
│   ├── utils/
│   │   ├── qrGenerator.js                     # NEW — generates QR code for booking
│   │   └── slotGenerator.js                   # NEW — auto-generates slots from doctor schedule
│   │
│   ├── .env
│   ├── server.js                              # existing — add new routes
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   │
│   │   ├── receptionist/                      # existing Phase 1 — minor updates
│   │   │   ├── ReceptionistPage.jsx           # existing
│   │   │   ├── Dashboard.jsx                  # update — add QR scan / name search for arrivals
│   │   │   ├── AddPatientForm.jsx             # existing — keep for walk-ins
│   │   │   ├── QueueList.jsx                  # existing
│   │   │   └── ArrivalConfirm.jsx             # NEW — confirms booked patient arrival
│   │   │
│   │   ├── patient/                           # extend Phase 1
│   │   │   ├── WaitingRoomPage.jsx            # existing
│   │   │   ├── CurrentToken.jsx               # existing
│   │   │   ├── TokensAhead.jsx                # existing
│   │   │   ├── WaitTimeDisplay.jsx            # existing
│   │   │   ├── PatientProfile.jsx             # NEW — personal details, medical history
│   │   │   ├── MedicalHistory.jsx             # NEW — upload and view past reports
│   │   │   └── BookingHistory.jsx             # NEW — past and upcoming appointments
│   │   │
│   │   ├── discovery/                         # NEW — the BookMyShow layer
│   │   │   ├── SearchPage.jsx                 # Home — symptom/specialty search
│   │   │   ├── SearchBar.jsx                  # Smart search with symptom suggestions
│   │   │   ├── HospitalList.jsx               # Search results — list of hospitals
│   │   │   ├── HospitalCard.jsx               # Single hospital card in results
│   │   │   ├── HospitalDetail.jsx             # Hospital page — all doctors for specialty
│   │   │   ├── DoctorCard.jsx                 # Single doctor card
│   │   │   ├── DoctorProfile.jsx              # Full doctor page with slot booking
│   │   │   ├── SlotPicker.jsx                 # Date + time slot grid (BookMyShow style)
│   │   │   ├── BookingConfirm.jsx             # Summary before confirming
│   │   │   └── BookingSuccess.jsx             # QR code + confirmation screen
│   │   │
│   │   ├── doctor/                            # NEW — doctor's own dashboard
│   │   │   ├── DoctorDashboard.jsx            # Today's queue + next patient info
│   │   │   ├── PatientHistoryView.jsx         # View patient's uploaded history
│   │   │   ├── ScheduleManager.jsx            # Set available days and hours
│   │   │   └── DoctorProfile.jsx              # Edit own profile, fee, languages
│   │   │
│   │   ├── admin/                             # existing — extend
│   │   │   ├── AdminPage.jsx                  # existing
│   │   │   ├── AnalyticsDashboard.jsx         # existing
│   │   │   ├── ClinicSettings.jsx             # existing
│   │   │   ├── HospitalOnboarding.jsx         # NEW — add hospital and its details
│   │   │   └── DoctorOnboarding.jsx           # NEW — add doctors to hospital
│   │   │
│   │   ├── shared/                            # existing — add new shared pieces
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx                 # update — add patient/doctor/admin nav
│   │   │   │   ├── LoadingSpinner.jsx         # existing
│   │   │   │   ├── QRDisplay.jsx              # NEW — shows QR code for bookings
│   │   │   │   ├── RatingStars.jsx            # NEW — star rating display
│   │   │   │   └── SpecialtyBadge.jsx         # NEW — colored tag for specialties
│   │   │   ├── hooks/
│   │   │   │   ├── useSocket.js               # existing
│   │   │   │   ├── useQueue.js                # existing
│   │   │   │   ├── useLocation.js             # NEW — get patient's GPS for nearby search
│   │   │   │   └── useAuth.js                 # NEW — Firebase Auth hook for all user types
│   │   │   ├── services/
│   │   │   │   ├── firebase.js                # existing
│   │   │   │   ├── queueService.js            # existing
│   │   │   │   ├── socketService.js           # existing
│   │   │   │   ├── hospitalService.js         # NEW — API calls for hospital/doctor data
│   │   │   │   ├── bookingService.js          # NEW — API calls for booking flow
│   │   │   │   └── patientService.js          # NEW — API calls for patient profile
│   │   │   └── utils/
│   │   │       ├── waitTimeCalculator.js      # existing
│   │   │       ├── symptomMapper.js           # NEW — maps symptoms to specialties
│   │   │       └── distanceCalculator.js      # NEW — haversine formula for nearby clinics
│   │   │
│   │   ├── App.jsx                            # update — add new routes
│   │   ├── main.jsx                           # existing
│   │   └── index.css                          # existing
│   │
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── socket-event-diagram.png               # existing
│   ├── thought-process-sheet.pdf              # existing
│   └── phase2-architecture.png               # NEW — updated system diagram
│
├── .gitignore
├── README.md
└── cliniqabout.md                             # this file
```

---

## What to Update in Existing Code

### backend/routes/queue.js
Add one new endpoint — `POST /queue/arrive` — which takes a booking ID, confirms the patient has arrived, and automatically adds them into the live queue at their booked position. Everything else in this file stays the same.

### backend/sockets/queueEvents.js
Add one new socket event — `booking:confirmed` — which fires when a booked patient is confirmed as arrived. All connected screens update to show the new patient has entered the queue. Three lines of code maximum.

### backend/services/queueService.js
Add one function — `addFromBooking(bookingId)` — which looks up the booking, pulls the patient's name and details, and calls the existing `addPatient` function. The existing queue logic handles everything else.

### frontend/receptionist/Dashboard.jsx
Add a second tab or section at the top — "Confirm Arrival". Receptionist types a patient's name or scans their QR code. System finds their booking, shows their details, receptionist taps confirm, they enter the queue. The existing "Add Patient" flow stays for walk-ins who didn't book.

### frontend/patient/WaitingRoomPage.jsx
No logic changes needed. Only UI update — if the patient arrived via a booking, show their booking details at the top (doctor name, booked slot time) alongside the live queue info.

### frontend/shared/components/Navbar.jsx
Currently has two links — Receptionist and Waiting Room. Update to show different navigation based on who is logged in. Patient sees Search, My Bookings, My Profile. Doctor sees their Dashboard. Receptionist sees Queue Dashboard. Admin sees Admin Panel. Firebase Auth drives which nav they see.

### frontend/App.jsx
Add new routes:
- `/search` — SearchPage (discovery home)
- `/hospital/:id` — HospitalDetail
- `/doctor/:id` — DoctorProfile and slot booking
- `/booking/success` — BookingSuccess with QR
- `/patient/profile` — PatientProfile
- `/doctor/dashboard` — DoctorDashboard
- `/admin/onboarding` — HospitalOnboarding

---

## Firebase Collections to Add

### hospitals
```
{
  id: auto,
  name: "City Care Clinic",
  address: "MG Road, Andheri West",
  location: { lat: 19.1234, lng: 72.8567 },
  phone: "+91 98765 43210",
  timings: { open: "08:00", close: "21:00" },
  specialties: ["general", "cardiology", "dermatology"],
  photos: ["url1", "url2"],
  rating: 4.3,
  totalRatings: 127,
  isActive: true
}
```

### doctors
```
{
  id: auto,
  hospitalId: "hospital_abc",
  name: "Dr. Priya Sharma",
  specialty: "cardiology",
  qualification: "MBBS, MD (Cardiology), AIIMS Delhi",
  experience: 12,
  languages: ["Hindi", "English", "Marathi"],
  fee: 500,
  photo: "url",
  schedule: {
    monday: { start: "10:00", end: "13:00", slotsPerHour: 4 },
    wednesday: { start: "10:00", end: "13:00", slotsPerHour: 4 },
    friday: { start: "16:00", end: "19:00", slotsPerHour: 4 }
  },
  rating: 4.7,
  totalRatings: 89,
  isActive: true
}
```

### slots
```
{
  id: auto,
  doctorId: "doctor_xyz",
  hospitalId: "hospital_abc",
  date: "2026-06-20",
  time: "10:15",
  status: "available",  // available | booked | blocked
  bookingId: null
}
```

### bookings
```
{
  id: auto,
  patientId: "patient_123",
  doctorId: "doctor_xyz",
  hospitalId: "hospital_abc",
  slotId: "slot_456",
  date: "2026-06-20",
  time: "10:15",
  qrCode: "data:image/png;base64,...",
  status: "confirmed",  // confirmed | arrived | in_queue | completed | cancelled
  createdAt: timestamp
}
```

### patients (new — extends Firebase Auth user)
```
{
  id: firebase_auth_uid,
  name: "Rahul Mehta",
  age: 34,
  bloodGroup: "B+",
  phone: "+91 98765 43210",
  medicalHistory: [
    {
      date: "2026-01-15",
      diagnosis: "Hypertension",
      prescription: "url_to_pdf",
      doctorId: "doctor_xyz"
    }
  ]
}
```

### symptoms (lookup table — one time setup)
```
{
  keyword: "fever",
  specialty: "general",
  relatedKeywords: ["temperature", "cold", "chills", "body ache"]
}
```

---

## How Each New Page Looks

### Search Page (Discovery Home)
This is the first screen a patient sees. Full-width search bar at the top with placeholder text "Search by symptom, disease or specialty". Below it a horizontal scrollable row of specialty chips — General Physician, Cardiologist, Dermatologist, Orthopedic, Pediatrician, Dentist, Gynecologist. Below that two sections — "Available near you now" showing 3-4 hospital cards, and "Top rated doctors today" showing doctor cards. Clean white background, green accent color for availability indicators.

### Hospital List Page (Search Results)
Patient searched "fever". Page title says "General Physicians near you — 12 results". Filter bar at the top — sort by Distance, Rating, Fee, Availability. Each hospital card is a horizontal card with the hospital name and address on the left, a green badge showing how many doctors are available today, a rating with star, and the earliest available slot time on the right. Tapping the card goes to Hospital Detail.

### Hospital Detail Page
Hospital name and photo banner at the top with timings and distance. Below that a section called "Doctors for General Medicine today" listing all matching doctors. Each doctor row shows photo thumbnail, name, qualification in one line, timing today, fee, rating, and a "Book" button on the right. If the hospital has other specialties relevant to the search, they appear below in a collapsible section called "Other available specialties at this hospital". This is the "other doctors for the same disease" feature you wanted — if you searched fever and this clinic also has an internal medicine specialist, they show here too.

### Doctor Profile and Slot Booking Page
Doctor's photo in a circle at the top left. Name, qualification, specialty, and experience on the right. Below that three info pills — fee, languages, rating. Then a section "About Dr. X" with 2-3 lines of bio. Below that a horizontal date picker showing today and next 6 days — tapping a date changes the slot grid below. The slot grid shows time slots in a 3-column grid — each slot is a rounded button, green if available, gray if booked. Tapping an available slot highlights it in your brand color. Below the grid a sticky "Confirm Booking" button that stays visible while scrolling. Exactly like BookMyShow's showtime and seat selection experience.

### Booking Success Page
Full screen confirmation. Large QR code in the center. Below it the booking summary — doctor name, hospital, date, time slot. Below that two buttons — "Add to Calendar" and "Share Booking". At the bottom a note saying "Show this QR code to the receptionist when you arrive". Clean, minimal, confident. Patient knows exactly what to do next.

### Doctor Dashboard Page
Doctor logs in and sees this. Top section shows today's queue in the live queue system — current patient, next 3 patients in line, each showing their name, reason for visit, and a button to view their medical history. Middle section shows today's booking summary — 12 booked, 8 confirmed arrived, 3 remaining, 1 cancelled. Bottom section shows tomorrow's pre-bookings so the doctor knows what to expect. A "Call Next Patient" button is prominent and centered — when the doctor clicks this it fires the same `token:callNext` socket event from Phase 1, syncing immediately with the receptionist screen and all patient waiting screens.

### Receptionist Arrival Confirm Screen
New tab on the existing receptionist dashboard called "Check In". Two ways to confirm arrival — a camera icon that opens QR scanner, and a search box to type patient name. When a match is found, a card pops up showing the patient's name, booked doctor, booked time, and a large green "Confirm Arrival" button. One tap confirms them into the queue. Below this the existing live queue list from Phase 1 shows all confirmed patients in order.

---

## What Phase 2 Feels Like End to End

Patient at home feels unwell. Opens Cliniq, types "chest pain". Sees 5 cardiologists available near them today. Taps the one with the best rating and earliest slot. Picks 11:15am. Gets a QR code. Drives to the clinic. Shows QR to receptionist. One tap and they're in the queue. Sits in the waiting room. Waiting room screen shows Token 14 currently being seen. They are Token 17. Estimated wait 18 minutes. Gets a WhatsApp message at Token 15 — "Your turn is coming up in about 10 minutes at City Care Clinic." Walks in at Token 17. Doctor already has their name and reason for visit on screen. Consult happens. Done.

That is the full Cliniq experience. That is what you are building.

---

## Build Order for Phase 2

1. Firebase Auth — patient and doctor login (everything needs this)
2. Hospital and doctor onboarding — add test data for 5 real clinics
3. Symptom search and specialty mapping
4. Hospital list and hospital detail screens
5. Doctor profile and slot picker
6. Booking creation and QR generation
7. Receptionist arrival confirm flow
8. Connect booking arrival to existing Phase 1 queue
9. Doctor dashboard
10. Patient profile and medical history upload
11. WhatsApp / push notifications

---

*Cliniq — Built for the 76% of India's clinics that still run on paper.*
