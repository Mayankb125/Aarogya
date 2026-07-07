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
          className="max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={unlockReceptionist}
        >
          <label className="block text-sm font-medium text-slate-700" htmlFor="pin">
            Staff PIN
          </label>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
            id="pin"
            inputMode="numeric"
            onChange={(event) => setPin(event.target.value)}
            type="password"
            value={pin}
          />
          {pinError ? <p className="mt-2 text-sm text-rose-700">{pinError}</p> : null}
          <button
            className="mt-4 w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
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
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">New patient</h2>
            <StatusBadge isConnected={isConnected} />
          </div>

          <form className="space-y-4" onSubmit={submitPatient}>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="name">
                Patient name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
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
                <p className="mt-1 text-xs text-slate-500">Name is required.</p>
              ) : null}
              {formError ? (
                <p className="mt-1 text-sm text-rose-700">{formError}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="reason">
                Visit reason
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
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
              <label className="block text-sm font-medium text-slate-700" htmlFor="doctor">
                Assign Doctor
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 bg-white"
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
              <label className="block text-sm font-medium text-slate-700" htmlFor="avgTime">
                Avg consultation time
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  className="w-24 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  id="avgTime"
                  min="1"
                  onChange={changeAvgConsultTime}
                  type="number"
                  value={avgConsultTime}
                />
                <span className="text-sm text-slate-600">minutes</span>
              </div>
            </div>

            <button
              className="w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!isConnected || isSaving || !form.name.trim()}
              type="submit"
            >
              Add Patient
            </button>
          </form>
        </section>

        <section className="space-y-5">
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Current token</p>
              <p className="mt-2 text-3xl font-bold">
                {currentToken ? `#${currentToken.tokenNumber}` : '-'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Waiting</p>
              <p className="mt-2 text-3xl font-bold">{queue.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Average time</p>
              <p className="mt-2 text-3xl font-bold">{avgConsultTime}m</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!isConnected || isSaving || queue.length === 0}
              onClick={() => actions.callNext()}
              type="button"
            >
              Call Next
            </button>
            <button
              className="rounded-md border border-rose-300 px-4 py-2 font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              disabled={!isConnected || isSaving}
              onClick={() => actions.resetQueue()}
              type="button"
            >
              Reset Queue
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-amber-300 bg-amber-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-200 px-4 py-3">
              <h2 className="font-semibold text-amber-900">
                Pending bookings ({pendingBookings.length})
              </h2>
              <button
                className="rounded-md border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                onClick={loadPendingBookings}
                type="button"
              >
                Refresh
              </button>
            </div>
            {bookingError ? (
              <p className="p-4 text-sm text-rose-800">{bookingError}</p>
            ) : pendingLoading ? (
              <p className="p-4 text-slate-600">Loading pending bookings...</p>
            ) : pendingBookings.length === 0 ? (
              <p className="p-4 text-slate-600">No pending bookings waiting for confirmation.</p>
            ) : (
              <div className="divide-y divide-amber-100">
                {pendingBookings.map((booking) => (
                  <div className="p-4" key={booking.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{booking.patientName}</p>
                        <p className="text-sm text-slate-600">
                          {booking.doctor?.name || booking.doctorId} · {booking.date} {booking.time}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Booking ID: {booking.id}
                        </p>
                      </div>
                      <button
                        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        disabled={confirmingId === booking.id}
                        onClick={() => handleConfirmBooking(booking.id)}
                        type="button"
                      >
                        {confirmingId === booking.id ? 'Confirming...' : 'Confirm & queue'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-semibold">Waiting patients</h2>
            </div>
            {isLoading ? (
              <p className="p-4 text-slate-600">Loading queue...</p>
            ) : queue.length === 0 ? (
              <p className="p-4 text-slate-600">Queue is empty.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {queue.map((patient) => (
                  <div
                    className="grid gap-3 p-4 md:grid-cols-[90px_1fr_120px_120px]"
                    key={patient.id}
                  >
                    <strong>#{patient.tokenNumber}</strong>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.reason}</p>
                    </div>
                    <p className="text-sm text-slate-600">
                      {patient.tokensAhead} ahead
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {patient.waitTime} min
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
