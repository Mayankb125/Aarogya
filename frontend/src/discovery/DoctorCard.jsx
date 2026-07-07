import { Link } from 'react-router-dom'
import RatingStars from '../shared/components/RatingStars'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function getTodayScheduleLabel(schedule) {
  const today = DAYS[new Date().getDay()]
  const todaySchedule = schedule?.[today]
  if (!todaySchedule) return 'Not available today'
  return `${todaySchedule.start}–${todaySchedule.end}`
}

function DoctorCard({ doctor }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
          {doctor.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold">{doctor.name}</h4>
          <p className="truncate text-sm text-slate-500">{doctor.qualification}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
            <RatingStars rating={doctor.rating} totalRatings={doctor.totalRatings} />
            <span className="text-slate-600">₹{doctor.fee}</span>
            <span className="text-slate-600">{getTodayScheduleLabel(doctor.schedule)}</span>
          </div>
          {doctor.bio ? (
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">{doctor.bio}</p>
          ) : null}
        </div>
      </div>
      <Link
        className="shrink-0 self-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        to={`/doctor/${doctor.id}`}
      >
        Book
      </Link>
    </div>
  )
}

export default DoctorCard
