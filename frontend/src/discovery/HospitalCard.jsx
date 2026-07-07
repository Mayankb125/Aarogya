import { Link } from 'react-router-dom'
import RatingStars from '../shared/components/RatingStars'
import SpecialtyBadge from '../shared/components/SpecialtyBadge'
import { getSpecialtyLabel } from '../shared/utils/symptomMapper'

function HospitalCard({ hospital }) {
  return (
    <Link
      className="block rounded-2xl border border-slate-150/40 bg-white/90 p-6 shadow-premium-sm hover:border-emerald-500 hover:shadow-premium-md transition-all duration-300"
      to={`/hospital/${hospital.id}${hospital.matchingSpecialty ? `?specialty=${hospital.matchingSpecialty}` : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-md font-extrabold text-slate-900">{hospital.name}</h3>
          <p className="mt-1 text-xs text-slate-400 font-medium">{hospital.address}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
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
          <span className="inline-block rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-emerald-700">
            {hospital.doctorsAvailableToday} doctor{hospital.doctorsAvailableToday === 1 ? '' : 's'} today
          </span>
          {hospital.earliestSlot ? (
            <p className="mt-2 text-2xs font-bold uppercase tracking-wider text-slate-400">
              Earliest: <span className="text-slate-600 font-mono">{hospital.earliestSlot}</span>
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export default HospitalCard
