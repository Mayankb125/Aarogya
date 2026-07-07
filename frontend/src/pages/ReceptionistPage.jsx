import { useEffect, useState } from 'react'
import PageShell from '../shared/components/PageShell'
import useQueue from '../shared/hooks/useQueue'
import { confirmBooking, listPendingBookings } from '../shared/services/bookingService'
import { listDoctors } from '../shared/services/doctorService'

const STAFF_PIN = '1234'

function StatusBadge({ isConnected }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isConnected
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-rose-100 text-rose-800'
      }`}
    >
      {isConnected ? 'Live' : 'Offline'}
    </span>
  )
}

function ReceptionistPage() {
  const {
    actions,
    avgConsultTime,
    currentToken,
    error,
    isConnected,
    isLoading,
    isSaving,
    queue,
  } = useQueue()
  const [isUnlocked, setIsUnlocked] = useState(
    sessionStorage.getItem('aarogya-staff') === 'true',
  )
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [form, setForm] = useState({
    name: '',
    reason: '',
    doctorId: '',
  })
  const [doctorsList, setDoctorsList] = useState([])
  const [formError, setFormError] = useState('')
  const [pendingBookings, setPendingBookings] = useState([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [bookingError, setBookingError] = useState('')

  async function loadPendingBookings() {
    setPendingLoading(true)
    setBookingError('')
    try {
      const data = await listPendingBookings()
      setPendingBookings(data)
    } catch (loadError) {
      setBookingError(loadError.response?.data?.message || loadError.message)
    } finally {
      setPendingLoading(false)
    }
  }

  useEffect(() => {
    if (!isUnlocked) return
    let cancelled = false
    ;(async () => {
      setPendingLoading(true)
      setBookingError('')
      try {
        const data = await listPendingBookings()
        if (cancelled) return
        setPendingBookings(data)
      } catch (loadError) {
        if (!cancelled) setBookingError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setPendingLoading(false)
      }
    })()

    // Fetch doctors list for selection
    ;(async () => {
      try {
        const list = await listDoctors()
        if (cancelled) return
        setDoctorsList(list || [])
        if (list && list.length > 0) {
          setForm((currentForm) => ({ ...currentForm, doctorId: list[0].id }))
        }
      } catch (err) {
        console.error("Failed to load active doctors", err)
      }
    })()

    return () => { cancelled = true }
  }, [isUnlocked])

  async function handleConfirmBooking(bookingId) {
    setConfirmingId(bookingId)
    setBookingError('')
    try {
      await confirmBooking(bookingId)
      await loadPendingBookings()
    } catch (confirmError) {
      setBookingError(confirmError.response?.data?.message || confirmError.message)
    } finally {
      setConfirmingId(null)
    }
  }

  function unlockReceptionist(event) {
    event.preventDefault()

    if (pin !== STAFF_PIN) {
      setPinError('Invalid staff PIN')
      return
    }

    sessionStorage.setItem('aarogya-staff', 'true')
    setIsUnlocked(true)
    setPinError('')
  }

  async function submitPatient(event) {
    event.preventDefault()

    // Frontend blocks obvious empty names; backend repeats validation for safety.
    if (!form.name.trim()) {
      setFormError('Patient name is required')
      return
    }

    setFormError('')
    const state = await actions.addPatient({
      name: form.name,
      reason: form.reason,
      avgConsultTime,
      doctorId: form.doctorId || null,
    })

    if (state) {
      setForm((currentForm) => ({
        ...currentForm,
        name: '',
        reason: '',
      }))
    }
  }

  async function changeAvgConsultTime(event) {
    const nextValue = event.target.value

    if (Number(nextValue) > 0) {
      await actions.updateAvgConsultTime(nextValue)
    }
  }

  if (!isUnlocked) {
    return (
      <PageShell
        eyebrow="Receptionist"
        title="Staff access"
        description="Receptionist controls are protected by a simple Phase 1 PIN."
      >
        <form
          className="max-w-sm rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-md p-6 shadow-premium-lg animate-slide-up"
          onSubmit={unlockReceptionist}
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="pin">
            Staff PIN
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
            id="pin"
            inputMode="numeric"
            onChange={(event) => setPin(event.target.value)}
            type="password"
            value={pin}
          />
          {pinError ? <p className="mt-2 text-xs font-semibold text-rose-600">{pinError}</p> : null}
          <button
            className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 active:scale-[0.97] transition-all duration-200 cursor-pointer text-sm"
            type="submit"
          >
            Open Dashboard
          </button>
        </form>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Receptionist"
      title="Queue control dashboard"
      description="Add patients, adjust consultation time, call the next token, and reset the queue."
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-premium-md h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-900">New Patient</h2>
            <StatusBadge isConnected={isConnected} />
          </div>

          <form className="space-y-4" onSubmit={submitPatient}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="name">
                Patient Name
              </label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
                id="name"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Anita Rao"
                value={form.name}
              />
              {!form.name.trim() ? (
                <p className="mt-1 text-2xs font-semibold text-slate-400">Name is required.</p>
              ) : null}
              {formError ? (
                <p className="mt-1.5 text-xs font-semibold text-rose-600">{formError}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="reason">
                Visit Reason
              </label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
                id="reason"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    reason: event.target.value,
                  }))
                }
                placeholder="General consultation"
                value={form.reason}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="doctor">
                Assign Doctor
              </label>
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200 bg-white select-none cursor-pointer font-medium"
                id="doctor"
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    doctorId: event.target.value,
                  }))
                }
                value={form.doctorId}
              >
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="avgTime">
                Avg Consultation Time
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200"
                  id="avgTime"
                  min="1"
                  onChange={changeAvgConsultTime}
                  type="number"
                  value={avgConsultTime}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">minutes</span>
              </div>
            </div>

            <button
              className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              disabled={!isConnected || isSaving || !form.name.trim()}
              type="submit"
            >
              Add Patient to Queue
            </button>
          </form>
        </section>

        <section className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-rose-150 bg-rose-50/70 p-4 text-xs font-semibold leading-relaxed text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-5 shadow-premium-sm">
              <p className="text-2xs font-bold uppercase tracking-widest text-slate-400">Current Token</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {currentToken ? `#${currentToken.tokenNumber}` : '-'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-5 shadow-premium-sm">
              <p className="text-2xs font-bold uppercase tracking-widest text-slate-400">Waiting</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">{queue.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-5 shadow-premium-sm">
              <p className="text-2xs font-bold uppercase tracking-widest text-slate-400">Average Time</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">{avgConsultTime}m</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
              disabled={!isConnected || isSaving || queue.length === 0}
              onClick={() => actions.callNext()}
              type="button"
            >
              Call Next Patient
            </button>
            <button
              className="rounded-xl border border-rose-200 bg-white px-6 py-3 font-bold text-rose-600 hover:bg-rose-50/50 hover:border-rose-300 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 cursor-pointer"
              disabled={!isConnected || isSaving}
              onClick={() => actions.resetQueue()}
              type="button"
            >
              Reset Queue
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/20 shadow-premium-sm">
            <div className="flex items-center justify-between border-b border-amber-100/50 bg-amber-50/40 px-5 py-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Pending Bookings ({pendingBookings.length})
              </h2>
              <button
                className="rounded-xl border border-amber-200 bg-white px-3.5 py-1.5 text-2xs font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-50/50 transition cursor-pointer"
                onClick={loadPendingBookings}
                type="button"
              >
                Refresh
              </button>
            </div>
            {bookingError ? (
              <p className="p-5 text-xs text-rose-700 font-semibold">{bookingError}</p>
            ) : pendingLoading ? (
              <p className="p-5 text-xs text-slate-500 font-medium animate-pulse">Loading pending bookings...</p>
            ) : pendingBookings.length === 0 ? (
              <p className="p-5 text-xs text-slate-500 font-medium">No pending bookings waiting for check-in.</p>
            ) : (
              <div className="divide-y divide-amber-100/60 bg-white/60">
                {pendingBookings.map((booking) => (
                  <div className="p-5 hover:bg-amber-50/10 transition" key={booking.id}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{booking.patientName}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {booking.doctor?.name || booking.doctorId} · {booking.date} {booking.time}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400 font-mono">
                          ID: {booking.id}
                        </p>
                      </div>
                      <button
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 cursor-pointer"
                        disabled={confirmingId === booking.id}
                        onClick={() => handleConfirmBooking(booking.id)}
                        type="button"
                      >
                        {confirmingId === booking.id ? 'Confirming...' : 'Check-In & Queue'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm shadow-premium-md">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Waiting Patients</h2>
            </div>
            {isLoading ? (
              <p className="p-5 text-xs text-slate-500 font-medium animate-pulse">Loading queue...</p>
            ) : queue.length === 0 ? (
              <p className="p-5 text-xs text-slate-500 font-medium">Queue is currently empty.</p>
            ) : (
              <div className="divide-y divide-slate-100/50">
                {queue.map((patient) => (
                  <div
                    className="grid gap-4 p-5 hover:bg-slate-50/20 transition items-center grid-cols-[60px_1fr_100px_100px]"
                    key={patient.id}
                  >
                    <strong className="text-sm font-extrabold text-slate-900 font-mono">#{patient.tokenNumber}</strong>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{patient.reason}</p>
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                      {patient.tokensAhead} ahead
                    </p>
                    <p className="text-xs font-bold text-emerald-600 font-mono text-right">
                      +{patient.waitTime} mins
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default ReceptionistPage
