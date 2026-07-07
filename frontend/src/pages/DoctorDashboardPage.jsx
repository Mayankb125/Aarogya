import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageShell from '../shared/components/PageShell'
import useQueue from '../shared/hooks/useQueue'
import { getDoctorDashboard } from '../shared/services/doctorService'

function PatientHistoryPanel({ history }) {
  if (!history) {
    return (
      <p className="mt-3 text-sm text-slate-500">
        Walk-in patient — no stored profile, reports, or past consultations on file.
      </p>
    )
  }

  const lastVisit = history.medicalHistory && history.medicalHistory[0]

  return (
    <div className="mt-3 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Age</p>
          <p className="font-medium">{history.age ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Blood group</p>
          <p className="font-medium">{history.bloodGroup ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
          <p className="font-medium">{history.phone ?? '-'}</p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Last visit</p>
        {lastVisit ? (
          <p className="mt-1 font-medium">
            {lastVisit.date} — {lastVisit.diagnosis}
          </p>
        ) : (
          <p className="mt-1 text-slate-500">No past consultations recorded.</p>
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
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {index === 0 ? 'Now serving' : `Up next #${index + 1}`}
          </p>
          <p className="text-lg font-semibold">
            #{patient.tokenNumber} · {patient.name}
          </p>
          <p className="text-sm text-slate-600">{patient.reason || 'No reason given'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? 'Hide' : 'Quick view'}
          </button>
          {hasStoredProfile ? (
            <Link
              to={`/doctor/${doctorId}/patient/${history.patientId}`}
              className="rounded-md bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Open full record
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
    default: 'border-slate-200 bg-white',
    emphasised: 'border-emerald-300 bg-emerald-50',
    warning: 'border-amber-300 bg-amber-50',
  }
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClasses[tone] || toneClasses.default}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
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
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              isConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isConnected ? 'Live updates on' : 'Waiting for server'}
          </span>
          <span className="text-sm text-slate-600">
            Avg consultation: {avgConsultTime} minutes · Queue: {myQueue.length}
          </span>
          <button
            className="rounded-md bg-slate-950 px-5 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!isConnected || isSaving || myQueue.length === 0}
            onClick={handleCallNext}
            type="button"
          >
            {isSaving ? 'Calling...' : 'Call Next Patient'}
          </button>
          <Link
            to={`/doctor/${id}/profile`}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            My Profile Settings
          </Link>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            {liveCurrentPatient ? (
              <PatientCard patient={liveCurrentPatient} index={0} doctorId={id} />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                No patient is being seen right now.
              </div>
            )}

            {liveUpcoming.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Coming up next</h2>
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

          <aside className="space-y-4">
            <div>
              <h2 className="mb-3 text-lg font-semibold">Today's booking summary</h2>
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Booked" value={bookingSummary.booked} />
                <SummaryCard label="Arrived" value={bookingSummary.arrived} tone="emphasised" />
                <SummaryCard label="In queue" value={bookingSummary.inQueue} />
                <SummaryCard label="Remaining" value={bookingSummary.remaining} tone="warning" />
                <SummaryCard label="Completed" value={bookingSummary.completed} />
                <SummaryCard label="Cancelled" value={bookingSummary.cancelled} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold">Today's bookings</h2>
              {todaysBookings.length === 0 ? (
                <p className="text-sm text-slate-600">No patients booked for today yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {todaysBookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0"
                    >
                      <span className="font-medium">{booking.patientName}</span>
                      <span className="text-slate-500">{booking.time}</span>
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        {booking.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold">Tomorrow's pre-bookings</h2>
              {tomorrowsBookings.length === 0 ? (
                <p className="text-sm text-slate-600">No pre-bookings for tomorrow.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {tomorrowsBookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0"
                    >
                      <span className="font-medium">{booking.patientName}</span>
                      <span className="text-slate-500">{booking.time}</span>
                      <span className="text-xs font-semibold uppercase text-slate-500">
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