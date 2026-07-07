import { useState } from 'react'
import { SPECIALTIES } from '../shared/utils/symptomMapper'

function SearchBar({ value, onChange, onSubmit, suggestions = [] }) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setShowSuggestions(false)
    onSubmit(value)
  }

  function pickSuggestion(keyword) {
    onChange(keyword)
    setShowSuggestions(false)
    onSubmit(keyword)
  }

  return (
    <div className="relative w-full">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition duration-200 shadow-premium-sm"
          onChange={(event) => {
            onChange(event.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search by symptom, disease or specialty"
          type="text"
          value={value}
        />
        <button
          className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.97] transition-all duration-200 cursor-pointer text-sm"
          type="submit"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-100 bg-white/95 backdrop-blur-md shadow-premium-lg divide-y divide-slate-100 animate-fade-in">
          {suggestions.slice(0, 6).map((rule) => (
            <button
              className="block w-full px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800 transition duration-200 cursor-pointer"
              key={rule.keyword}
              onClick={() => pickSuggestion(rule.keyword)}
              type="button"
            >
              <span className="font-bold text-slate-900">{rule.keyword}</span>
              <span className="text-slate-400 font-medium"> → {rule.specialty}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {SPECIALTIES.map((specialty) => (
          <button
            className="rounded-xl border border-slate-200 bg-white/60 px-3.5 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-600 shadow-premium-sm hover:border-emerald-500 hover:text-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            key={specialty.id}
            onClick={() => pickSuggestion(specialty.label)}
            type="button"
          >
            {specialty.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchBar
