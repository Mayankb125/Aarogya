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
          className="w-full rounded-md border border-slate-300 px-4 py-3 text-base outline-none focus:border-emerald-500"
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
          className="rounded-md bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
          type="submit"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {suggestions.slice(0, 6).map((rule) => (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50"
              key={rule.keyword}
              onClick={() => pickSuggestion(rule.keyword)}
              type="button"
            >
              <span className="font-medium">{rule.keyword}</span>
              <span className="text-slate-500"> → {rule.specialty}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {SPECIALTIES.map((specialty) => (
          <button
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
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
