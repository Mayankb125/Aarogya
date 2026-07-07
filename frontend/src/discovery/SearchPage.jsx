import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchHospitals } from '../shared/services/hospitalService'
import { searchSymptoms } from '../shared/services/symptomService'
import { matchSymptom, getSpecialtyLabel } from '../shared/utils/symptomMapper'
import SearchBar from './SearchBar'
import HospitalList from './HospitalList'
import PageShell from '../shared/components/PageShell'

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [specialty, setSpecialty] = useState('')
  const [matchedKeyword, setMatchedKeyword] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [sortBy, setSortBy] = useState('rating')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await searchSymptoms('')
        if (cancelled) return
        setSuggestions(data.suggestions || [])
      } catch {
        // Suggestions are a nice-to-have; local mapper covers the gap.
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Sync state when URL query parameters change (e.g. from header search bar)
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    setSubmittedQuery(q)
  }, [searchParams])

  useEffect(() => {
    if (!submittedQuery) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await searchHospitals({ q: submittedQuery })
        if (cancelled) return
        setResults(data.results || [])
        setSpecialty(data.specialty || '')
        setMatchedKeyword(data.matchedKeyword || null)
      } catch (loadError) {
        if (!cancelled) setError(loadError.response?.data?.message || loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [submittedQuery])

  function handleSubmit(value) {
    const trimmed = String(value || '').trim()
    setSubmittedQuery(trimmed)
    setQuery(trimmed)
    if (trimmed) {
      setSearchParams({ q: trimmed })
    } else {
      setSearchParams({})
    }
  }

  const hasQuery = submittedQuery.length > 0
  const localMatch = hasQuery ? matchSymptom(submittedQuery) : null

  return (
    <PageShell
      eyebrow="Care Search"
      title="Find a doctor near you"
      description="Search by symptom, disease, or specialty. We map it to the right doctor and show nearby clinics with open slots."
    >
      <div className="space-y-6">
        <SearchBar
          onChange={setQuery}
          onSubmit={handleSubmit}
          suggestions={suggestions}
          value={query}
        />

        {error ? (
          <div className="rounded-xl border border-rose-150 bg-rose-50/70 p-4 text-xs font-semibold leading-relaxed text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-2">
          {hasQuery ? (
            loading ? (
              <p className="text-xs text-slate-500 font-semibold animate-pulse">Searching hospitals...</p>
            ) : (
              <HospitalList
                matchedKeyword={matchedKeyword}
                onSortChange={setSortBy}
                results={results}
                sortBy={sortBy}
                specialty={localMatch ? getSpecialtyLabel(localMatch.specialty) : specialty}
              />
            )
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 text-center shadow-premium-sm space-y-2">
              <p className="text-sm font-bold text-slate-800">Start your search above</p>
              <p className="text-xs text-slate-500 font-medium">Type a symptom like "fever" or "chest pain", or pick a specialty chip to see nearby hospitals with available doctors.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

export default SearchPage
