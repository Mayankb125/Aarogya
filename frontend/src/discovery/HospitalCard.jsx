import { Link } from 'react-router-dom'
import RatingStars from '../shared/components/RatingStars'
import SpecialtyBadge from '../shared/components/SpecialtyBadge'
import { getSpecialtyLabel } from '../shared/utils/symptomMapper'

function HospitalCard({ hospital }) {
  return (
    <Link
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"
      to={`/hospital/${hospital.id}${hospital.matchingSpecialty ? `?specialty=${hospital.matchingSpecialty}` : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">{hospital.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{hospital.address}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <RatingStars rating={hospital.rating} totalRatings={hospital.totalRatings} />
            {hospital.matchingSpecialty ? (
              <SpecialtyBadge
                label={getSpecialtyLabel(hospital.matchingSpecialty)}
                specialty={hospital.matchingSpecialty}
              />
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {hospital.doctorsAvailableToday} doctor{hospital.doctorsAvailableToday === 1 ? '' : 's'} today
          </span>
          {hospital.earliestSlot ? (
            <p className="mt-2 text-xs text-slate-500">
              Earliest: {hospital.earliestSlot}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export default HospitalCard
