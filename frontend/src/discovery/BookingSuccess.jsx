import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { getBookingDetail } from '../shared/services/bookingService'
import { getSpecialtyLabel } from '../shared/utils/symptomMapper'
import PageShell from '../shared/components/PageShell'

function BookingSuccess() {
  const { id } = useParams()
  const location = useLocation()
  const passedBooking = location.state?.booking

  const [booking, setBooking] = useState(passedBooking || null)
  const [loading, setLoading] = useState(!passedBooking)
  const [error, setError] = useState('')

  useEffect(() => {
    if (passedBooking) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await getBookingDetail(id)
        if (cancelled) return
        setBooking(data)
      } catch (loadError) {
        if (!cancelled) setError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id, passedBooking])

  return (
    <PageShell
      eyebrow="Booking"
      title="Booking received"
      description="Your appointment request has been sent. The receptionist will confirm it and add you to the live queue."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-slate-600">Loading booking...</p>
        ) : booking ? (
          <>
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="text-4xl">{'\u2713'}</p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-800">Request submitted</h2>
              <p className="mt-2 text-sm text-emerald-700">
                Booking ID: <strong>{booking.id}</strong>
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Status: <strong className="capitalize">{booking.status}</strong> — waiting for receptionist to confirm.
              </p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Appointment details</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Patient</dt>
                  <dd className="font-medium">{booking.patientName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Doctor</dt>
                  <dd className="font-medium">{booking.doctor?.name || booking.doctorId}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Specialty</dt>
                  <dd className="font-medium">{booking.doctor ? getSpecialtyLabel(booking.doctor.specialty) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Hospital</dt>
                  <dd className="font-medium">{booking.hospital?.name || booking.hospitalId}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Date</dt>
                  <dd className="font-medium">{booking.date}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Time</dt>
                  <dd className="font-medium">{booking.time}</dd>
                </div>
              </dl>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
                to="/search"
              >
                Search more doctors
              </Link>
              <Link
                className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                to="/waiting"
              >
                View waiting room
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </PageShell>
  )
}

export default BookingSuccess
