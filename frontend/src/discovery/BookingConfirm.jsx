import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createBooking } from '../shared/services/bookingService'
import { getSpecialtyLabel } from '../shared/utils/symptomMapper'
import PageShell from '../shared/components/PageShell'
import { useAuth } from '../shared/context/AuthContext'

function BookingConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { doctor, slot } = location.state || {}

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login?redirect=' + encodeURIComponent('/booking/confirm'), {
        replace: true,
        state: { bookingState: location.state }
      })
    }
  }, [user, isLoading, navigate, location.state])

  if (isLoading) {
    return (
      <PageShell eyebrow="Booking" title="Confirm booking" description="Checking session...">
        <div className="space-y-4">
          <p className="text-slate-600">Verifying session details...</p>
        </div>
      </PageShell>
    )
  }

  if (!doctor || !slot) {
    return (
      <PageShell
        eyebrow="Booking"
        title="Confirm booking"
        description="No booking selection found. Please pick a slot from a doctor profile."
      >
        <Link className="text-sm font-semibold text-emerald-700" to="/search">
          &larr; Back to search
        </Link>
      </PageShell>
    )
  }

  async function submit(event) {
    event.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError('')
    try {
      const booking = await createBooking({
        doctorId: doctor.id,
        slotId: slot.id,
        patientId: user.uid,
        patientName: user.displayName,
      })
      navigate(`/booking/success/${booking.id}`, { state: { booking } })
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      eyebrow="Booking"
      title="Confirm your appointment"
      description="Review the details and submit. The receptionist will confirm your booking and add you to the live queue."
    >
      <div className="space-y-6">
        <Link className="text-sm font-semibold text-emerald-700" to={`/doctor/${doctor.id}`}>
          &larr; Back to doctor
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Appointment summary</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Doctor</dt>
              <dd className="font-medium">{doctor.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Specialty</dt>
              <dd className="font-medium">{getSpecialtyLabel(doctor.specialty)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Hospital</dt>
              <dd className="font-medium">{doctor.hospital?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Fee</dt>
              <dd className="font-medium">₹{doctor.fee}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd className="font-medium">{slot.date}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Time</dt>
              <dd className="font-medium">{slot.time}</dd>
            </div>
          </dl>
        </section>

        <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
          <h2 className="text-lg font-semibold">Patient details</h2>
          <div className="border-b border-slate-100 pb-3 text-sm">
            <span className="text-slate-500">Booking as: </span>
            <span className="font-bold text-slate-900">{user?.displayName || user?.email}</span>
          </div>

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}

          <button
            className="w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Confirming...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

export default BookingConfirm
