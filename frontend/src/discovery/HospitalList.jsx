import HospitalCard from './HospitalCard'

const SORT_OPTIONS = [
  { id: 'distance', label: 'Distance' },
  { id: 'rating', label: 'Rating' },
  { id: 'fee', label: 'Fee' },
  { id: 'availability', label: 'Availability' },
]

function sortResults(results, sortBy) {
  const copy = [...results]
  if (sortBy === 'rating') {
    return copy.sort((a, b) => b.rating - a.rating)
  }
  if (sortBy === 'availability') {
    return copy.sort((a, b) => {
      if (a.earliestSlot && !b.earliestSlot) return -1
      if (!a.earliestSlot && b.earliestSlot) return 1
      return String(a.earliestSlot).localeCompare(String(b.earliestSlot))
    })
  }
  return copy
}

function HospitalList({ results, specialty, matchedKeyword, sortBy, onSortChange }) {
  const sorted = sortResults(results, sortBy)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-950">{results.length}</span> result{results.length === 1 ? '' : 's'}
          {specialty ? <> for <span className="font-semibold text-emerald-700">{specialty}</span></> : null}
          {matchedKeyword ? <> · matched &ldquo;{matchedKeyword}&rdquo;</> : null}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Sort by</span>
          <select
            className="rounded-md border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500"
            onChange={(event) => onSortChange(event.target.value)}
            value={sortBy}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          No hospitals found with available doctors for this search. Try a different symptom or specialty.
        </p>
      ) : (
        <div className="grid gap-4">
          {sorted.map((hospital) => (
            <HospitalCard hospital={hospital} key={hospital.id} />
          ))}
        </div>
      )}
    </div>
  )
}

export default HospitalList
