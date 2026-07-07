import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageShell from '../shared/components/PageShell'
import useQueue from '../shared/hooks/useQueue'
import { getDoctorDashboard } from '../shared/services/doctorService'

function PatientHistoryPanel({ history }) {
  if (!history) {
    return (
      <p className="mt-3 text-xs font-semibold text-slate-400">
        Walk-in patient — no stored profile, reports, or past consultations on file.
      </p>
    )
  }

  const lastVisit = history.medicalHistory && history.medicalHistory[0]

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-5 text-xs">
      <div className="grid gap-3 grid-cols-3">
        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Age</p>
          <p className="font-bold text-slate-800 font-mono mt-0.5">{history.age ?? '-'}</p>
        </div>
        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Blood group</p>
          <p className="font-bold text-slate-800 font-mono mt-0.5">{history.bloodGroup ?? '-'}</p>
        </div>
        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Phone</p>
          <p className="font-bold text-slate-800 font-mono mt-0.5">{history.phone ?? '-'}</p>
        </div>
      </div>

      <div className="border-t border-slate-100/70 pt-3">
        <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Last visit</p>
        {lastVisit ? (
          <p className="mt-1 font-semibold text-slate-700">
            {lastVisit.date} — {lastVisit.diagnosis}
          </p>
        ) : (
          <p className="mt-1 text-slate-400 font-medium">No past consultations recorded.</p>
        )}
      </div>
    </div>
  )
}

function PatientCard({ patient, index, doctorId }) {
  const [expanded, setExpanded] = useState(index === 0)

  if (!patient) return null

  const history = patient.medicalHistory
  const hasStoredProfile = Boolean(history?.patientId)

  return (
    <div className="rounded-2xl border border-slate-150/40 bg-white/90 p-5 shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-emerald-600">
            {index === 0 ? 'Now serving' : `Up next #${index + 1}`}
          </p>
          <p className="text-md font-extrabold text-slate-900 mt-0.5">
            #{patient.tokenNumber} · {patient.name}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">{patient.reason || 'No reason given'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? 'Hide' : 'Quick view'}
          </button>
          {hasStoredProfile ? (
            <Link
              to={`/doctor/${doctorId}/patient/${history.patientId}`}
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition cursor-pointer"
            >
              Open Patient Record
            </Link>
          ) : null}
        </div>
      </div>
      {expanded ? <PatientHistoryPanel history={history} /> : null}
    </div>
  )
}

function SummaryCard({ label, value, tone }) {
  const toneClasses = {
    default: 'border-slate-100 bg-white/80',
    emphasised: 'border-emerald-250 bg-emerald-50/50 text-emerald-800 shadow-emerald-500/2',
    warning: 'border-amber-200 bg-amber-50/40 text-amber-800',
  }
  return (
    <div className={`rounded-2xl border p-4 shadow-premium-sm ${toneClasses[tone] || toneClasses.default}`}>
      <p className="text-2xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight font-mono">{value}</p>
    </div>
  )
}

function DoctorDashboardPage() {
  const { id } = useParams()
  const { actions, avgConsultTime, currentToken, error, isConnected, isSaving, queue } =
    useQueue()
  const [dashboard, setDashboard] = useState(null)
  const [dashboardError, setDashboardError] = useState('')
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)

  const loadDashboard = async () => {
    setIsLoadingDashboard(true)
    setDashboardError('')
    try {
      const data = await getDoctorDashboard(id)
      setDashboard(data)
    } catch (loadError) {
      setDashboardError(loadError.response?.data?.message || loadError.message)
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoadingDashboard(true)
      setDashboardError('')
      try {
        const data = await getDoctorDashboard(id)
        if (!cancelled) setDashboard(data)
      } catch (loadError) {
        if (!cancelled) setDashboardError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setIsLoadingDashboard(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  // Socket already pushes queue updates via useQueue; surface currentToken + queue
  // live so the doctor never sees a stale "now serving" card.
  // Filter queue and currentToken to only show patients assigned to this doctor
  const myCurrentToken = currentToken && currentToken.doctorId === id ? currentToken : null;
  const myQueue = queue.filter((patient) => patient.doctorId === id);

  const liveCurrentPatient = myCurrentToken
    ? {
        ...myCurrentToken,
        medicalHistory:
          dashboard?.currentPatient?.tokenNumber === myCurrentToken.tokenNumber
            ? dashboard.currentPatient.medicalHistory
            : null,
      }
    : null

  const liveUpcoming = myQueue.slice(0, 3).map((patient) => {
    const match = dashboard?.upcomingPatients?.find(
      (item) => item.tokenNumber === patient.tokenNumber,
    )
    return {
      ...patient,
      medicalHistory: match?.medicalHistory ?? null,
    }
  })

  async function handleCallNext() {
    const state = await actions.callNext(id)
    if (state) {
      loadDashboard()
    }
  }

  if (isLoadingDashboard) {
    return (
      <PageShell
        eyebrow="Doctor"
        title="Doctor dashboard"
        description="Loading today's queue and bookings..."
      >
        <p className="text-slate-600">Loading dashboard...</p>
      </PageShell>
    )
  }

  if (dashboardError) {
    return (
      <PageShell
        eyebrow="Doctor"
        title="Doctor dashboard"
        description="Could not load the dashboard."
      >
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {dashboardError}
        </div>
      </PageShell>
    )
  }

  if (!dashboard) return null

  const { doctor, bookingSummary, todaysBookings, tomorrowsBookings } = dashboard

  return (
    <PageShell
      eyebrow="Doctor"
      title={doctor.name}
      description={`${doctor.specialty} · ${doctor.qualification || 'MBBS'} · ${doctor.hospital?.name || ''}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-premium-sm">
          <span
            className={`rounded-xl px-3.5 py-1.5 text-2xs font-bold uppercase tracking-wider ${
              isConnected
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
            }`}
          >
            {isConnected ? 'Sync Online' : 'Waiting for Sync'}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg consult: <span className="font-mono text-emerald-600 font-extrabold">{avgConsultTime}m</span> · Queue: <span className="font-mono text-slate-900 font-extrabold">{myQueue.length}</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer text-xs uppercase tracking-wider"
              disabled={!isConnected || isSaving || myQueue.length === 0}
              onClick={handleCallNext}
              type="button"
            >
              {isSaving ? 'Calling...' : 'Call Next'}
            </button>
            <Link
              to={`/doctor/${id}/profile`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-premium-sm transition duration-200"
            >
              Settings
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-150 bg-rose-50/70 p-4 text-xs font-semibold leading-relaxed text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            {liveCurrentPatient ? (
              <PatientCard patient={liveCurrentPatient} index={0} doctorId={id} />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 text-xs font-semibold text-slate-400 shadow-premium-sm">
                No patient is currently checking in or being seen.
              </div>
            )}

            {liveUpcoming.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Coming up next</h2>
                {liveUpcoming.map((patient, index) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    index={index + 1}
                    doctorId={id}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Today's booking summary</h2>
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Booked" value={bookingSummary.booked} />
                <SummaryCard label="Arrived" value={bookingSummary.arrived} tone="emphasised" />
                <SummaryCard label="In queue" value={bookingSummary.inQueue} />
                <SummaryCard label="Remaining" value={bookingSummary.remaining} tone="warning" />
                <SummaryCard label="Completed" value={bookingSummary.completed} />
                <SummaryCard label="Cancelled" value={bookingSummary.cancelled} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-5 shadow-premium-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Today's bookings</h2>
              {todaysBookings.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">No appointments booked for today.</p>
              ) : (
                <ul className="space-y-2 text-xs divide-y divide-slate-100/60">
                  {todaysBookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-3 pb-2 pt-2 first:pt-0 border-0"
                    >
                      <span className="font-bold text-slate-800">{booking.patientName}</span>
                      <span className="text-slate-450 font-medium font-mono">{booking.time}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5">
                        {booking.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-5 shadow-premium-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tomorrow's pre-bookings</h2>
              {tomorrowsBookings.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">No pre-bookings for tomorrow.</p>
              ) : (
                <ul className="space-y-2 text-xs divide-y divide-slate-100/60">
                  {tomorrowsBookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-3 pb-2 pt-2 first:pt-0 border-0"
                    >
                      <span className="font-bold text-slate-800">{booking.patientName}</span>
                      <span className="text-slate-450 font-medium font-mono">{booking.time}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-150 rounded-lg px-2 py-0.5">
                        {booking.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </section>
      </div>
    </PageShell>
  )
}

export default DoctorDashboardPage