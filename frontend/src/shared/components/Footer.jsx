import { Link } from 'react-router-dom'
import logoImage from '../../assets/Aarogya.png'

const FOOTER_LINKS = [
  { to: '/search', label: 'Find a doctor' },
  { to: '/patient/profile', label: 'My Profile' },
  { to: '/receptionist', label: 'Receptionist' },
  { to: '/waiting', label: 'Waiting Room' },
  { to: '/admin/onboarding', label: 'Admin' },
]

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <img src={logoImage} alt="Aarogya Logo" className="h-5 w-auto object-contain shrink-0" />
          <span className="font-semibold text-emerald-700">Aarogya</span>
          <span className="text-slate-350 font-light hidden sm:inline">|</span>
          <span>Smart clinic queue management</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-emerald-700">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} Aarogya. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer