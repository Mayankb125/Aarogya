import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getHospitalDetail } from '../shared/services/hospitalService'
import { getSpecialtyLabel } from '../shared/utils/symptomMapper'
import DoctorCard from './DoctorCard'
import PageShell from '../shared/components/PageShell'
import SpecialtyBadge from '../shared/components/SpecialtyBadge'

function HospitalDetail() {
  const [searchParams] = useSearchParams()
  const hospitalId = window.location.pathname.split('/').pop()
  const specialty = searchParams.get('specialty') || ''

  const [hospital, setHospital] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getHospitalDetail(hospitalId, specialty)
        if (cancelled) return
        setHospital(data)
      } catch (loadError) {
        if (!cancelled) setError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [hospitalId, specialty])

  const matchingDoctors = useMemo(
    () => hospital?.doctors || [],
    [hospital],
  )
  const otherDoctors = useMemo(
    () => hospital?.otherDoctors || [],
    [hospital],
  )

  return (
    <PageShell
      eyebrow="Hospital"
      title={hospital ? hospital.name : 'Hospital detail'}
      description={hospital ? hospital.address : 'Loading hospital details and available doctors.'}
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
          <p className="text-slate-600">Loading hospital...</p>
        ) : hospital ? (
          <>
            <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timings</p>
                <p className="mt-1 font-medium">{hospital.timings?.open}–{hospital.timings?.close}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                <p className="mt-1 font-medium">{hospital.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specialties</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Array.isArray(hospital.specialties) ? hospital.specialties.map((id) => (
                    <SpecialtyBadge key={id} label={getSpecialtyLabel(id)} specialty={id} />
                  )) : null}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">
                {specialty ? `${getSpecialtyLabel(specialty)}s` : 'Doctors'} available today
              </h2>
              {matchingDoctors.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600">
                  No doctors available for this specialty today.
                </p>
              ) : (
                <div className="grid gap-3">
                  {matchingDoctors.map((doctor) => (
                    <DoctorCard doctor={doctor} key={doctor.id} />
                  ))}
                </div>
              )}
            </section>

            {otherDoctors.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-xl font-bold">Other available specialties at this hospital</h2>
                <div className="grid gap-3">
                  {otherDoctors.map((doctor) => (
                    <DoctorCard doctor={doctor} key={doctor.id} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </PageShell>
  )
}

export default HospitalDetail
