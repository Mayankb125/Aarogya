import { useEffect, useState } from 'react'
import PageShell from '../shared/components/PageShell'
import useQueue from '../shared/hooks/useQueue'
import { useAuth } from '../shared/context/AuthContext'
import { listDoctors } from '../shared/services/doctorService'
import { searchBookings } from '../shared/services/bookingService'

function WaitingRoomPage() {
  const { user } = useAuth()
  const { avgConsultTime, currentToken, error, isConnected, isLoading, queue } = useQueue()

  const [activeDoctorId, setActiveDoctorId] = useState('')
  const [doctors, setDoctors] = useState([])
  const [patientBookings, setPatientBookings] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  // 1. Load active doctors list
  useEffect(() => {
    listDoctors()
      .then((data) => {
        setDoctors(data || [])
      })
      .catch((err) => console.error('Failed to load doctors list:', err))
      .finally(() => setLoadingDoctors(false))
  }, [])

  // 2. Fetch logged-in patient bookings to find their scheduled clinicians
  useEffect(() => {
    if (!user || user.role !== 'patient') return

    const searchQuery = user.displayName || user.email.split('@')[0]
    searchBookings(searchQuery)
      .then((bookings) => {
        const active = bookings.filter((b) =>
          ['in_queue', 'arrived', 'confirmed'].includes(b.status)
        )
        setPatientBookings(active)
        
        // Auto-select the first booked doctor if available
        if (active.length > 0) {
          setActiveDoctorId(active[0].doctorId)
        }
      })
      .catch((err) => console.error('Failed to resolve active booking:', err))
  }, [user])

  // 3. Auto-select doctor ID if logged in as doctor
  useEffect(() => {
    if (user && user.role === 'doctor') {
      setActiveDoctorId(user.doctorId)
    }
  }, [user])

  // Filter allowed doctors based on user role
  let allowedDoctors = []
  if (user) {
    if (user.role === 'admin' || user.role === 'receptionist') {
      allowedDoctors = doctors
    } else if (user.role === 'doctor') {
      allowedDoctors = doctors.filter((d) => d.id === user.doctorId)
    } else {
      // Patients can only select from doctors they have booked appointments with
      const bookedIds = new Set(patientBookings.map((b) => b.doctorId))
      allowedDoctors = doctors.filter((d) => bookedIds.has(d.id))
    }
  }

  // Recalculate queue metrics filtered specifically for the selected doctor
  const filteredCurrentToken = currentToken && currentToken.doctorId === activeDoctorId ? currentToken : null

  const filteredQueue = queue
    .filter((patient) => patient.doctorId === activeDoctorId)
    .map((patient, index) => ({
      ...patient,
      tokensAhead: index,
      waitTime: index * avgConsultTime,
    }))

  const selectedDoctorInfo = doctors.find((d) => d.id === activeDoctorId)

  return (
    <PageShell
      eyebrow="Waiting Room"
      title="Live patient queue"
      description="Current token, tokens ahead, and wait time update live without refreshing."
    >
      <div className="space-y-6">
        {/* Connection status header */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-xl px-3.5 py-1.5 text-2xs font-bold uppercase tracking-wider ${
              isConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-105 text-rose-800 border border-rose-200 animate-pulse'
            }`}
          >
            {isConnected ? 'Live Sync Active' : 'Offline / Reconnecting'}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Avg Consultation: <span className="font-mono text-emerald-600 font-extrabold">{avgConsultTime}</span> minutes
          </span>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-150 bg-rose-50/70 p-4 text-xs font-semibold leading-relaxed text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Doctor Selector / Status Bar */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-sm flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[200px]">
            <label htmlFor="select-doctor-queue" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Filter by Clinician
            </label>
            {loadingDoctors ? (
              <p className="text-xs text-slate-400 font-medium mt-2 animate-pulse">Loading doctors...</p>
            ) : allowedDoctors.length === 0 ? (
              <p className="text-xs font-bold text-rose-600 mt-2">
                No active appointments scheduled for today.
              </p>
            ) : (
              <select
                id="select-doctor-queue"
                value={activeDoctorId}
                onChange={(e) => setActiveDoctorId(e.target.value)}
                className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-premium-sm outline-none focus:border-emerald-500 focus:bg-white transition duration-200 cursor-pointer"
              >
                {allowedDoctors.length > 1 && <option value="">-- Select Clinician --</option>}
                {allowedDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {user && user.role === 'patient' && activeDoctorId && selectedDoctorInfo && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 border border-emerald-150 px-4 py-2 text-xs font-bold text-emerald-700 shadow-premium-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Monitoring your scheduled doctor ({selectedDoctorInfo.name})
            </div>
          )}
        </div>

        {/* Queue Display */}
        {allowedDoctors.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-8 text-center shadow-premium-md space-y-2">
            <p className="text-sm font-bold text-slate-800">No active queues to watch</p>
            <p className="text-xs text-slate-500 font-medium">You must have an active confirmed or check-in appointment today to monitor the clinician's live queue status.</p>
          </div>
        ) : !activeDoctorId ? (
          <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-8 text-center shadow-premium-md space-y-2">
            <p className="text-sm font-bold text-slate-800">Please select a clinician</p>
            <p className="text-xs text-slate-500 font-medium">Please choose one of your scheduled doctors from the dropdown filter above to inspect their live waiting room queue.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Now Serving
                </p>
                <p className="mt-3 text-7xl font-black text-emerald-600 font-mono tracking-tight">
                  {filteredCurrentToken ? `#${filteredCurrentToken.tokenNumber}` : '-'}
                </p>
                <p className="mt-4 text-xs font-semibold text-slate-500 leading-relaxed">
                  {filteredCurrentToken
                    ? `${filteredCurrentToken.name} is with the doctor.`
                    : 'No token has been called yet.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Waiting Patients
                </p>
                <p className="mt-3 text-7xl font-black text-slate-800 font-mono tracking-tight">{filteredQueue.length}</p>
                <p className="mt-4 text-xs font-semibold text-slate-500 leading-relaxed">
                  {filteredQueue.length === 0
                    ? 'Queue is currently empty.'
                    : 'Please watch your token number.'}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm shadow-premium-lg">
              <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Queue Status · {selectedDoctorInfo?.name || 'Clinician'}
                </h2>
              </div>
              {isLoading ? (
                <p className="p-5 text-xs text-slate-500 font-medium animate-pulse">Loading live queue...</p>
              ) : filteredQueue.length === 0 ? (
                <p className="p-5 text-xs text-slate-500 font-medium">No waiting tokens for this doctor.</p>
              ) : (
                <div className="divide-y divide-slate-100/50">
                  {filteredQueue.map((patient) => (
                    <div
                      className="grid gap-4 p-5 hover:bg-slate-50/20 transition items-center grid-cols-[60px_1fr_100px_100px]"
                      key={patient.id}
                    >
                      <strong className="text-sm font-extrabold text-slate-900 font-mono">#{patient.tokenNumber}</strong>
                      <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                      <p className="text-xs font-semibold text-slate-400">
                        {patient.tokensAhead} ahead
                      </p>
                      <p className="text-xs font-bold text-emerald-600 font-mono text-right">
                        +{patient.waitTime} mins wait
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </PageShell>
  )
}

export default WaitingRoomPage
