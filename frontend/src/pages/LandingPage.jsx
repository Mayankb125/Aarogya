import { Link } from 'react-router-dom'
import Header from '../shared/components/Header'
import Footer from '../shared/components/Footer'
import heroImage from '../assets/hero.png'

const metrics = [
  { value: '30 sec', label: 'Check-in Speed', desc: 'Frictionless patient intake workflow.' },
  { value: 'Real-Time', label: 'WebSocket Sync', desc: 'No manual refreshing or browser polling.' },
  { value: 'Dynamic', label: 'Lobby Predictions', desc: 'Auto-calculates wait times on every sync.' },
  { value: 'Role-Gated', label: 'Security Protocols', desc: 'Dedicated staff, clinician & patient boundaries.' },
]

const workflowSteps = [
  {
    title: '1. Register Patient Check-In',
    description:
      'Reception adds the patient name and reason for visit in seconds. Aarogya assigns a unique token number instantly.',
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    title: '2. Synchronize Lobby Monitors',
    description:
      'Queue updates propagate globally instantly. Patients track progress on lobby TVs or their personal mobile devices.',
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: '3. clinician Handoff',
    description:
      'Clinicians call the next token with one action. Monitors ring and flash, keeping the lobby moving smoothly.',
    icon: (
      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

const featureGroups = [
  {
    title: 'Receptionist Panel',
    role: 'Staff Command Center',
    description:
      'Intake dashboard optimized for high-pressure desks. Quickly add patients, override token flows, and manage clinic-wide expected consultation durations.',
    points: ['Rapid patient registration', 'Dynamic consultation averages', 'One-click queue advancement', 'Bulk queue resets & token gates'],
  },
  {
    title: 'Lobby Waiting Screen',
    role: 'Patient Display Monitor',
    description:
      'A readable, clean interface designed to be cast to a TV or loaded on user smartphones. Reduces front desk repetitive queries.',
    points: ['Flashing "Now Serving" updates', 'Dynamic "Tokens Ahead" indicator', 'Live wait-time estimations', 'High-contrast, bold readability'],
  },
  {
    title: 'Doctor Portal',
    role: 'Clinical Insights Panel',
    description:
      'Gives doctors a detailed view of incoming check-ins, reasons for visits, and past histories before calling patients into the room.',
    points: ['Reason-for-visit markers', 'Historic diagnostic summaries', 'Secure patient credential protection', 'Seamless token handover flow'],
  },
]

function ProductMockup() {
  const queueRows = [
    { token: '#23', name: 'Anita Rao', status: 'Next Up', wait: '5 min', color: 'text-teal-700 bg-teal-50 border-teal-100' },
    { token: '#24', name: 'Rohan Mehta', status: '1 ahead', wait: '10 min', color: 'text-slate-500 bg-slate-50 border-slate-100' },
    { token: '#25', name: 'Sara Khan', status: '2 ahead', wait: '15 min', color: 'text-slate-500 bg-slate-50 border-slate-100' },
  ]

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-2xl relative overflow-hidden group">
      {/* Decorative gradient glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-teal-500/5 rounded-full filter blur-2xl transition-all duration-700" />
      
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-100">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            Lobby Display Live
          </span>
          <p className="mt-2 text-base font-bold text-slate-800">
            Aarogya Control Dashboard
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-mono">ACTIVE INSTANCE</span>
          <span className="text-xs font-bold text-teal-600 font-mono">PORT 5175</span>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-3 mb-5">
        <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-100 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Now serving
          </p>
          <p className="mt-2 text-3xl font-extrabold text-teal-600">#22</p>
        </div>
        <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-100 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Queue Size
          </p>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">3</p>
        </div>
        <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-100 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Avg Consultation
          </p>
          <p className="mt-2 text-3xl font-extrabold text-indigo-950">5m</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Upcoming Patients</p>
        <div className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
          {queueRows.map((row) => (
            <div
              className="grid grid-cols-[60px_1fr_90px_60px] items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-sm last:border-b-0 hover:bg-slate-50/50 transition-colors"
              key={row.token}
            >
              <strong className="text-slate-600 font-mono">{row.token}</strong>
              <span className="font-semibold text-slate-800">{row.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border text-center font-medium ${row.color}`}>
                {row.status}
              </span>
              <span className="font-mono text-right text-teal-600 font-bold">{row.wait}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 overflow-x-hidden font-sans">
      <Header variant="landing" />

      {/* Hero Section: Rich High-Contrast Dark-Teal Frame */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#111827_30%,#134e4a_100%)] py-20 lg:py-28 text-white">
        {/* Soft backlights */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl px-5 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="max-w-3xl text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3.5 py-1 text-sm font-semibold text-emerald-300 border border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Dynamic Clinic Token Network
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] md:text-5xl tracking-tight text-white">
              Streamline Clinic Waiting Lists.{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-200 bg-clip-text text-transparent">
                Keep Patients Calm.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              A comprehensive clinic queueing network. Give receptionists full queue control, 
              provide doctors with advance clinical intake profiles, and keep patients relaxed with real-time wait estimations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                to="/search"
              >
                Search Doctors
              </Link>
              <Link
                className="rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-md px-6 py-3.5 font-bold text-slate-200 hover:border-slate-500 hover:text-white transition-all shadow-sm"
                to="/receptionist"
              >
                Launch Reception Demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 rounded-2xl filter blur-xl transform scale-105 -z-10" />
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* Metrics Section: Clean slate background with prominent metrics cards */}
      <section className="relative border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div 
                className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200/60 text-left hover:border-slate-300 hover:bg-white hover:shadow-md transition-all" 
                key={metric.label}
              >
                <p className="text-2xl font-extrabold text-teal-600">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">{metric.label}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section: Crisp clean card layout */}
      <section className="py-20 lg:py-24 bg-white" id="workflow">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl text-left mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">OPERATIONAL PIPELINE</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Visual, coordinated queue coordination.
            </h2>
            <p className="mt-4 text-slate-600">
              Matches physical clinic workflows to ease receptionist loads and keep rooms aligned.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-8 text-left hover:border-slate-300 hover:shadow-xl hover:bg-slate-50/20 transition-all group"
                key={step.title}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-white transition-all shadow-sm">
                  {step.icon}
                </span>
                <h3 className="mt-6 text-lg font-bold text-slate-800">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section: Balanced contrast with light-gray background & white feature cards */}
      <section className="bg-slate-50/60 border-y border-slate-200/80 py-20 lg:py-24" id="features">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-3xl text-left mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">DEDICATED PORTALS</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Role-specific features for doctors, staff, and patients.
            </h2>
            <p className="mt-4 text-slate-600">
              Separate views ensure patients see what they need, staff have control, and medical data remains isolated.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureGroups.map((group) => (
              <article
                className="rounded-2xl border border-slate-200/80 bg-white p-6 text-left hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between"
                key={group.title}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <h3 className="text-lg font-bold text-slate-800">{group.title}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200/60">
                      {group.role}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {group.description}
                  </p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-600 pt-5 border-t border-slate-100">
                  {group.points.map((point) => (
                    <li className="flex items-center gap-3 text-xs" key={point}>
                      <svg className="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section: Clean, structured layout with subtle interactive cues */}
      <section className="py-20 lg:py-24 bg-white" id="demo">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl text-left mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">LIVE WORKFLOW TRIAL</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Run both ends side-by-side.
            </h2>
            <p className="mt-4 text-slate-600">
              Open the staff control panel and patient lobby display simultaneously to observe real-time database transmissions.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-left hover:border-slate-350 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-100">
                  Staff Access
                </span>
                <h3 className="mt-4 text-xl font-bold text-slate-800">Reception Control Panel</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  Allows receptionists to easily register patients, skip missed tokens, adjust expected wait constants, and forward active cues with a single click.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  className="inline-flex rounded-xl bg-teal-600 px-6 py-3.5 font-bold text-white hover:bg-teal-700 transition-all shadow-md shadow-teal-600/10"
                  to="/receptionist"
                >
                  Launch Staff Panel
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-left hover:border-slate-350 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                  Lobby Access
                </span>
                <h3 className="mt-4 text-xl font-bold text-slate-800">Patient Waiting Display</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  A high-contrast visual display designed to run on large lobby TVs or patients' personal devices. Shows served tokens and updates in real-time.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 font-bold text-slate-600 hover:border-slate-350 hover:bg-slate-100/80 transition-all"
                  to="/waiting"
                >
                  Launch Waiting Room
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="relative py-20 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">GET STARTED NOW</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Keep your lobby aligned, your staff happy, and your patients informed.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-slate-500 leading-relaxed">
            Aarogya sets up in minutes. Bring instant clarity to your medical reception and let patients track their estimated queue numbers live.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-teal-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              to="/receptionist"
            >
              Test Receptionist Control
            </Link>
            <Link
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-600 hover:border-slate-350 hover:bg-slate-50/50 transition-all shadow-sm"
              to="/waiting"
            >
              Cast Waiting Screen
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
