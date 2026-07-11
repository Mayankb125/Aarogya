import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoImage from '../../assets/Aarogya.png'
import { searchSymptoms } from '../services/symptomService'

const NAV_LINKS = [
  { to: '/search', label: 'Find Doctor' },
  { to: '/receptionist', label: 'Receptionist' },
  { to: '/doctor/dr-priya-sharma/dashboard', label: 'Doctor' },
  { to: '/waiting', label: 'Waiting' },
  { to: '/admin/onboarding', label: 'Admin' },
]

function HeaderSearchBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    setInput(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    let active = true
    searchSymptoms('').then(data => {
      if (active) setSuggestions(data.suggestions || [])
    }).catch(() => {})
    return () => { active = false }
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setShowSuggestions(false)
    const trimmed = input.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/search')
    }
  }

  function pickSuggestion(keyword) {
    setInput(keyword)
    setShowSuggestions(false)
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
  }

  const filtered = suggestions.filter(rule => 
    rule.keyword.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 5)

  return (
    <div className="relative hidden sm:block w-48 md:w-72 lg:w-96">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search symptoms, clinics..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full rounded-full border border-slate-250 bg-slate-50 py-1.5 pl-9 pr-4 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-450 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition shadow-sm"
        />
      </form>

      {showSuggestions && filtered.length > 0 ? (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md shadow-premium-lg divide-y divide-slate-100 animate-fade-in">
          {filtered.map((rule) => (
            <button
              className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800 transition duration-200 cursor-pointer"
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
    </div>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) {
    const redirectParam = encodeURIComponent(location.pathname + location.search)
    return (
      <Link
        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition"
        to={`/login?redirect=${redirectParam}`}
      >
        Sign in
      </Link>
    )
  }

  let displayName = user.displayName || user.email || 'Signed in'
  let initial = (user.displayName || user.email || '?').charAt(0).toUpperCase()

  if (user.role === 'doctor') {
    let cleanName = displayName.replace(/^(dr\.?\s*)/i, '');
    let firstName = cleanName.trim().split(' ')[0];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    
    displayName = `Dr. ${firstName}`;
    initial = 'D';
  }

  const profilePath = user.role === 'doctor'
    ? `/doctor/${user.doctorId || 'dr-priya-sharma'}/profile`
    : user.role === 'admin'
      ? '/admin/onboarding'
      : '/patient/profile'

  async function handleLogout() {
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      console.error("Failed to sign out:", err)
    }
  }

  return (
    <div className="flex items-center gap-2.5 animate-fade-in">
      <Link
        to={profilePath}
        className="flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 transition"
        title="Open my profile"
      >
        <span className="hidden sm:inline">{displayName}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
          {initial}
        </span>
      </Link>
      <button
        onClick={handleLogout}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 cursor-pointer transition duration-200 active:scale-95"
        type="button"
      >
        Sign out
      </button>
    </div>
  )
}

function Header({ variant = 'default' }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isSearch = location.pathname === '/search'

  const brandClass = 'text-lg font-black tracking-tight text-slate-900 flex items-center gap-1 shrink-0'
  
  const isLandingVariant = variant === 'landing' || (variant === 'default' && isLanding)

  return (
    <header className="sticky top-0 z-35 border-b border-slate-150/50 bg-white/80 backdrop-blur-md shadow-premium-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 gap-4">
        <Link to="/" className={brandClass} aria-label="Aarogya home">
          <img src={logoImage} alt="Aarogya Logo" className="h-6 w-auto object-contain shrink-0" />
          <span>Aarogya</span>
          <span className="text-emerald-500 font-extrabold text-xl -ml-1">.</span>
        </Link>
        
        <HeaderSearchBar />

        <nav className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname.startsWith(link.to) && link.to !== '/' || (link.to === '/' && location.pathname === '/')
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`hidden md:inline transition duration-200 ${
                  isActive
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-500 pb-1.5 -mb-[18px]'
                    : 'hover:text-slate-900 hover:scale-[1.02]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <span className="mx-1 hidden h-4 w-px bg-slate-200 md:inline-block" />
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}

export default Header