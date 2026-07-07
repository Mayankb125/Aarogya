import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoctorProfile, getDoctorSlots } from '../shared/services/doctorService'
import { getSpecialtyLabel } from '../shared/utils/symptomMapper'
import PageShell from '../shared/components/PageShell'
import RatingStars from '../shared/components/RatingStars'
import SpecialtyBadge from '../shared/components/SpecialtyBadge'
import SlotPicker from './SlotPicker'

function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [slotDays, setSlotDays] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [profile, slots] = await Promise.all([getDoctorProfile(id), getDoctorSlots(id)])
        if (cancelled) return
        setDoctor(profile)
        setSlotDays(slots)
      } catch (loadError) {
        if (!cancelled) setError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  return (
    <PageShell
      eyebrow="Doctor"
      title={doctor ? doctor.name : 'Doctor profile'}
      description={doctor ? `${doctor.qualification} · ${getSpecialtyLabel(doctor.specialty)}` : 'Loading doctor profile and available slots.'}
    >
      <div className="space-y-6">
        <Link className="text-sm font-semibold text-emerald-700" to="/search">
          &larr; Back to search
        </Link>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-slate-600">Loading doctor profile...</p>
        ) : doctor ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700">
                  {doctor.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{doctor.name}</h2>
                  <p className="text-slate-600">{doctor.qualification}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <SpecialtyBadge specialty={doctor.specialty} label={getSpecialtyLabel(doctor.specialty)} />
                    <RatingStars rating={doctor.rating} totalRatings={doctor.totalRatings} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Fee: <strong className="text-slate-950">₹{doctor.fee}</strong></span>
                    <span>Experience: <strong className="text-slate-950">{doctor.experience} yrs</strong></span>
                    {Array.isArray(doctor.languages) && doctor.languages.length > 0 ? (
                      <span>Languages: <strong className="text-slate-950">{doctor.languages.join(', ')}</strong></span>
                    ) : null}
                  </div>
                  {doctor.bio ? (
                    <p className="mt-3 leading-7 text-slate-600">{doctor.bio}</p>
                  ) : null}
                  {doctor.hospital ? (
                    <Link
                      className="mt-3 inline-block text-sm font-semibold text-emerald-700"
                      to={`/hospital/${doctor.hospital.id}`}
                    >
                      {doctor.hospital.name} →
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Book a slot</h3>
              <p className="mt-1 text-sm text-slate-500">
                Pick a date and an open time slot. Green slots are available, gray are booked.
              </p>
              <div className="mt-4">
                <SlotPicker
                  onSelect={setSelectedSlot}
                  selectedSlot={selectedSlot}
                  slotDays={slotDays}
                />
              </div>

              {selectedSlot ? (
                <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">
                    Selected: <strong>{selectedSlot.date} at {selectedSlot.time}</strong>
                  </p>
                  <button
                    className="mt-3 w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
                    onClick={() =>
                      navigate('/booking/confirm', { state: { doctor, slot: selectedSlot } })
                    }
                    type="button"
                  >
                    Continue to confirmation
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  Select a slot above to continue.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </PageShell>
  )
}

export default DoctorProfile
