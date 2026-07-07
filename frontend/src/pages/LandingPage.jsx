import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../shared/components/Header'
import Footer from '../shared/components/Footer'

const metrics = [
  { value: 'Symptom Search', label: 'Intelligent Discovery', desc: 'Find the right specialist instantly based on your symptoms.' },
  { value: 'Pre-Booking', label: 'Time-Slot Reservation', desc: 'Schedule appointments online to secure your slot in advance.' },
  { value: 'Real-Time Sync', label: 'Live Queue Tracking', desc: 'Monitor live token updates from home or on lobby displays.' },
  { value: 'Patient Records', label: 'Clinician Workspace', desc: 'Doctors manage patient history, remarks, and follow-ups securely.' },
]

const steps = [
  {
    phase: '1. Discovery & Pre-Booking',
    title: 'Search by Symptoms',
    desc: 'Patients input symptoms like "joint pain" or "rash". Aarogya recommends the correct specialty (e.g. Orthopedics, Dermatology) and helps them pre-book a slot.',
    tag: 'Patient Flow',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    phase: '2. Check-In & Live Queueing',
    title: 'Digital Intake & Tokens',
    desc: 'On arrival, the receptionist checks in the patient. The booking is converted into a live queue token. Sockets sync updates instantly to lobby TVs and personal phones.',
    tag: 'Lobby Sync',
    color: 'bg-teal-50 text-teal-700 border-teal-100',
  },
  {
    phase: '3. Consultation & Patient Records',
    title: 'Clinical History & Remarks',
    desc: 'Doctors call the next token from their dashboard, review past clinical profiles, log diagnosis remarks, issue digital prescriptions, and schedule follow-ups.',
    tag: 'Doctor Flow',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
]

function InteractiveMockup() {
  const [activeTab, setActiveTab] = useState('discovery') // 'discovery' | 'lobby' | 'emr'

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-2xl relative overflow-hidden group animate-fade-in">
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-2xl" />
      
      {/* Platform Mockup Tabs */}
      <div className="flex border-b border-slate-100 pb-3 mb-5 gap-2">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'discovery'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          🔍 Care Search
        </button>
        <button
          onClick={() => setActiveTab('lobby')}
          className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'lobby'
              ? 'bg-teal-50 text-teal-800 border border-teal-100 shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          📺 Live Queue
        </button>
        <button
          onClick={() => setActiveTab('emr')}
          className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'emr'
              ? 'bg-indigo-50 text-indigo-800 border border-indigo-100 shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          🩺 Patient Records
        </button>
      </div>

      {/* Simulated Screens */}
      {activeTab === 'discovery' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5">
              PATIENT INTERFACE
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">Smart Clinic Finder</p>
          </div>
          
          {/* Simulated Input */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs flex items-center justify-between">
            <span className="text-slate-700 font-semibold">Symptom: <span className="text-emerald-700">"Skin rash and itching"</span></span>
            <span className="text-slate-400">🔍</span>
          </div>

          {/* Search Result Card */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-900">Dr. Priya Sharma</p>
                <p className="text-[10px] font-medium text-slate-500">Dermatologist · Care Hospital</p>
              </div>
              <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">98% Match</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">System mapped symptom "Skin rash" to Specialty "Dermatology".</p>
            <div className="flex gap-2 pt-1.5 border-t border-emerald-100/50">
              <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1">10:30 AM (Available)</span>
              <span className="text-[10px] font-bold text-white bg-emerald-600 rounded px-2 py-1 ml-auto">Pre-Book Slot</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lobby' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 rounded-lg px-2 py-0.5">
                LOBBY SCREEN
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">Live Queue Board</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-extrabold animate-pulse">● LIVE UPDATE</span>
          </div>

          <div className="grid gap-3 grid-cols-2">
            <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Now Serving</p>
              <p className="mt-1 text-2xl font-extrabold text-teal-600 font-mono">#22</p>
            </div>
            <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Patients Waiting</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-800 font-mono">3</p>
            </div>
          </div>

          {/* Queue Rows */}
          <div className="rounded-xl border border-slate-100 overflow-hidden text-xs">
            <div className="grid grid-cols-[50px_1fr_60px] items-center gap-2 border-b border-slate-100 px-3 py-2 bg-slate-50/50">
              <strong className="text-slate-600 font-mono">#23</strong>
              <span className="font-bold text-slate-800">Anita Rao</span>
              <span className="font-mono text-right text-emerald-600 font-extrabold">+5m wait</span>
            </div>
            <div className="grid grid-cols-[50px_1fr_60px] items-center gap-2 px-3 py-2">
              <strong className="text-slate-600 font-mono">#24</strong>
              <span className="font-bold text-slate-800">Rohan Mehta</span>
              <span className="font-mono text-right text-slate-500">+10m wait</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emr' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-0.5">
              CLINICIAN INTERFACE
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">Digital Case Chart</p>
          </div>

          {/* Patient Demographics */}
          <div className="grid gap-2 grid-cols-3 text-[10px] rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Age</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">28 Yrs</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Blood</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">O+ Positive</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider">Visits</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">4 Records</p>
            </div>
          </div>

          {/* Active consult sheet */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/15 p-3.5 space-y-1.5 text-2xs">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider">Diagnosis</p>
              <p className="font-bold text-slate-800 mt-0.5">Acute Dermatitis - skin allergic reaction</p>
            </div>
            <div className="border-t border-indigo-100/50 pt-1.5">
              <p className="text-slate-400 font-bold uppercase tracking-wider">Rx Prescription</p>
              <p className="font-bold text-slate-800 font-mono mt-0.5">Mometasone Cream 0.1% - apply thin layer once daily for 7 days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 overflow-x-hidden font-sans">
      <Header variant="landing" />

      {/* Hero Section: Modern Healthcare theme backdrop */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0a2540_0%,#0f172a_50%,#064e3b_100%)] py-20 lg:py-28 text-white">
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-5 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="max-w-3xl text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Comprehensive Smart Healthcare Portal
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] md:text-5xl tracking-tight text-white">
              Bridging Care Search,{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-200 bg-clip-text text-transparent">
                History &amp; Live Queues.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300">
              Aarogya is an integrated health workspace. Patients search specialties based on symptoms and pre-book calendar slots. 
              Receptionists coordinate intakes, while live monitors display WebSocket-synced wait calculations. Doctors review historical records and log consultation details securely.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                to="/search"
              >
                Search Doctors &amp; Book
              </Link>
              <Link
                className="rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-md px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:border-slate-500 hover:text-white transition-all shadow-sm cursor-pointer"
                to="/receptionist"
              >
                Launch Intake Desk
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 rounded-2xl filter blur-xl transform scale-105 -z-10" />
            <InteractiveMockup />
          </div>
        </div>
      </section>

      {/* Metrics / Ecosystem cards */}
      <section className="relative border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div 
                className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/60 text-left hover:border-slate-350 hover:bg-white hover:shadow-premium-md transition-all duration-300" 
                key={metric.label}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">{metric.label}</p>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section: The Unified Patient Journey */}
      <section className="py-20 lg:py-24 bg-white" id="ecosystem">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-3xl text-left mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">PATIENT JOURNEY</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              The Aarogya Unified Health Cycle
            </h2>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              We sync doctor search, scheduling, clinic lobby checking, live tracking, and clinical consultations into one unified database.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-8 text-left hover:border-slate-350 hover:shadow-premium-lg transition-all duration-300 flex flex-col justify-between"
                key={step.phase}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {step.phase}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl border ${step.color}`}>
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-slate-800">{step.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">{step.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Split Interactive Demo Cards */}
      <section className="py-20 lg:py-24 bg-slate-50 border-t border-slate-200" id="portals">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl text-left mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">LIVE WORKFLOW DEMO</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Explore Role-Gated Portals
            </h2>
            <p className="mt-4 text-sm text-slate-550 leading-relaxed">
              Test different platform roles to see how scheduling data transitions from patient search outputs to intake sheets and patient record sheets.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Patient View */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-slate-350 hover:shadow-premium-lg transition-all flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-bold text-emerald-700 border border-emerald-100">
                  Patient View
                </span>
                <h3 className="mt-4 text-md font-bold text-slate-800">Search &amp; Pre-Book</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
                  Search clinic networks by medical symptoms, map symptoms to active clinical departments, choose appointment times, and monitor wait status live.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/10 cursor-pointer"
                  to="/search"
                >
                  Search Clinicians
                </Link>
              </div>
            </div>

            {/* Receptionist View */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-slate-350 hover:shadow-premium-lg transition-all flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-2xs font-bold text-teal-700 border border-teal-100">
                  Staff View
                </span>
                <h3 className="mt-4 text-md font-bold text-slate-800">Reception Check-In</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
                  Accept walk-ins and confirm pre-booked appointments. Instantly convert bookings to live queue token positions, call tokens, and advance patients.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal-700 transition shadow-md shadow-teal-600/10 cursor-pointer"
                  to="/receptionist"
                >
                  Launch Receptionist PIN
                </Link>
              </div>
            </div>

            {/* Doctor View */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-slate-350 hover:shadow-premium-lg transition-all flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-2xs font-bold text-indigo-700 border border-indigo-100">
                  Doctor View
                </span>
                <h3 className="mt-4 text-md font-bold text-slate-800">Patient Case Files</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
                  Inspect diagnostic history files, review current symptom notes, prescribe medicines, save follow-up check calendars, and alert waiting lobbies.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-slate-350 hover:bg-slate-100 transition cursor-pointer"
                  to="/login"
                >
                  Login as Clinician
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="relative py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">GET STARTED</span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
            Streamline patient journeys from search to consultation.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs text-slate-500 leading-relaxed font-medium">
            Deploy Aarogya to help patients find care based on symptoms, check-in smoothly without queue bottlenecks, and give doctors comprehensive digital medical history records.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-teal-600/10 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              to="/search"
            >
              Start Care Search
            </Link>
            <Link
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:border-slate-350 hover:bg-slate-50 transition shadow-premium-sm cursor-pointer"
              to="/receptionist"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
