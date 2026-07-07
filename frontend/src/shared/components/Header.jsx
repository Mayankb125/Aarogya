import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

  useEffect(() => {
    setInput(searchParams.get('q') || '')
  }, [searchParams])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/search')
    }
  }

  return (
    <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-72 lg:w-96">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search symptoms, clinics..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-full border border-slate-250 bg-slate-50 py-1.5 pl-9 pr-4 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-450 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition shadow-sm"
      />
    </form>
  )
}

function UserMenu() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const redirectParam = encodeURIComponent(location.pathname + location.search)
    return (
      <Link
        className="rounded-md bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
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

  return (
    <div className="flex items-center gap-2">
      <Link
        to={profilePath}
        className="flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
        title="Open my profile"
      >
        <span className="hidden sm:inline">{displayName}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
          {initial}
        </span>
      </Link>
    </div>
  )
}

function Header({ variant = 'default' }) {
  // 'landing' variant renders over the dark hero, so it uses light text + transparent bg.
  const isLanding = variant === 'landing'

  const linkBase = isLanding
    ? 'text-slate-700 hover:text-emerald-700'
    : 'text-slate-600 hover:text-emerald-700'
  const brandClass = isLanding
    ? 'text-lg font-bold text-emerald-700'
    : 'text-lg font-bold text-emerald-700'

  return (
    <header
      className={
        isLanding
          ? 'sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur'
          : 'border-b border-slate-200 bg-white'
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 gap-4">
        <Link to="/" className={brandClass} aria-label="Aarogya home">
          Aarogya
        </Link>
        
        <HeaderSearchBar />

        <nav className="flex items-center gap-3 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={`hidden md:inline ${linkBase}`}>
              {link.label}
            </Link>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-slate-200 md:inline-block" />
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}

export default Header