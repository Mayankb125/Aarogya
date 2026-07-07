const SPECIALTY_STYLES = {
  general: 'bg-emerald-100 text-emerald-800',
  cardiology: 'bg-rose-100 text-rose-800',
  dermatology: 'bg-amber-100 text-amber-800',
  orthopedics: 'bg-blue-100 text-blue-800',
  pediatrics: 'bg-violet-100 text-violet-800',
  ophthalmology: 'bg-cyan-100 text-cyan-800',
  dentistry: 'bg-teal-100 text-teal-800',
  psychiatry: 'bg-fuchsia-100 text-fuchsia-800',
  gynecology: 'bg-pink-100 text-pink-800',
  gastroenterology: 'bg-orange-100 text-orange-800',
}

function SpecialtyBadge({ specialty, label }) {
  const style = SPECIALTY_STYLES[specialty] || 'bg-slate-100 text-slate-700'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label || specialty}
    </span>
  )
}

export default SpecialtyBadge
