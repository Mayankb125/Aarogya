import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchHospitals } from '../shared/services/hospitalService'
import { searchSymptoms } from '../shared/services/symptomService'
import { matchSymptom, getSpecialtyLabel } from '../shared/utils/symptomMapper'
import SearchBar from './SearchBar'
import HospitalList from './HospitalList'
import Header from '../shared/components/Header'
import Footer from '../shared/components/Footer'

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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <Header />
      
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-8">
        <header className="mb-6 text-left">
          <h1 className="text-3xl font-bold md:text-4xl text-slate-900">Find a doctor near you</h1>
          <p className="mt-2 text-slate-600">
            Search by symptom, disease, or specialty. We map it to the right doctor and show nearby clinics with open slots.
          </p>
        </header>

        <SearchBar
          onChange={setQuery}
          onSubmit={handleSubmit}
          suggestions={suggestions}
          value={query}
        />

        {error ? (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-8">
          {hasQuery ? (
            loading ? (
              <p className="text-slate-600 text-left">Searching hospitals...</p>
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
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
              <p className="text-lg font-semibold text-slate-950">Start your search above</p>
              <p>Type a symptom like &ldquo;fever&rdquo; or &ldquo;chest pain&rdquo;, or pick a specialty chip to see nearby hospitals with available doctors.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SearchPage
