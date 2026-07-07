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
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isConnected ? 'Live updates on' : 'Waiting for server'}
          </span>
          <span className="text-sm text-slate-600">
            Avg consultation: {avgConsultTime} minutes
          </span>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {/* Doctor Selector / Status Bar */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[200px]">
            <label htmlFor="select-doctor-queue" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Filter by Clinician
            </label>
            {loadingDoctors ? (
              <p className="text-sm text-slate-500 mt-2">Loading doctors...</p>
            ) : allowedDoctors.length === 0 ? (
              <p className="text-sm font-semibold text-rose-600 mt-2">
                No active appointments scheduled for today.
              </p>
            ) : (
              <select
                id="select-doctor-queue"
                value={activeDoctorId}
                onChange={(e) => setActiveDoctorId(e.target.value)}
                className="mt-2 rounded-md border border-slate-350 bg-white px-3 py-2 outline-none focus:border-emerald-500 text-sm font-semibold text-slate-700 shadow-sm"
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
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-150 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Monitoring your scheduled doctor ({selectedDoctorInfo.name})
            </div>
          )}
        </div>

        {/* Queue Display */}
        {allowedDoctors.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-650 shadow-sm space-y-2">
            <p className="text-lg font-bold text-slate-900">No active queues to watch</p>
            <p className="text-sm text-slate-600">You must have an active confirmed or check-in appointment today to monitor the clinician's live queue status.</p>
          </div>
        ) : !activeDoctorId ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-650 shadow-sm space-y-2">
            <p className="text-lg font-bold text-slate-900">Please select a clinician</p>
            <p className="text-sm text-slate-600">Please choose one of your scheduled doctors from the dropdown filter above to inspect their live waiting room queue.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Now serving
                </p>
                <p className="mt-3 text-6xl font-bold text-emerald-700">
                  {filteredCurrentToken ? `#${filteredCurrentToken.tokenNumber}` : '-'}
                </p>
                <p className="mt-3 text-slate-600">
                  {filteredCurrentToken
                    ? `${filteredCurrentToken.name} is with the doctor.`
                    : 'No token has been called yet.'}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Waiting patients
                </p>
                <p className="mt-3 text-6xl font-bold">{filteredQueue.length}</p>
                <p className="mt-3 text-slate-600">
                  {filteredQueue.length === 0
                    ? 'Queue is currently empty.'
                    : 'Please watch your token number.'}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                <h2 className="font-semibold text-sm text-slate-700">
                  Queue Status - {selectedDoctorInfo?.name || 'Clinician'}
                </h2>
              </div>
              {isLoading ? (
                <p className="p-4 text-slate-650">Loading live queue...</p>
              ) : filteredQueue.length === 0 ? (
                <p className="p-4 text-slate-650">No waiting tokens for this doctor.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredQueue.map((patient) => (
                    <div
                      className="grid gap-3 p-4 md:grid-cols-[90px_1fr_120px_120px]"
                      key={patient.id}
                    >
                      <strong>#{patient.tokenNumber}</strong>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-slate-605">
                        {patient.tokensAhead} ahead
                      </p>
                      <p className="text-sm font-semibold text-emerald-750">
                        {patient.waitTime} min wait
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
