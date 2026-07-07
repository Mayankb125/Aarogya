import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/context/AuthContext'
import { hasFirebaseConfig } from '../shared/services/firebase'
import api from '../shared/services/api'
import Header from '../shared/components/Header'
import Footer from '../shared/components/Footer'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, signInWithGoogle, error, clearError } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  const customRedirect = new URLSearchParams(location.search).get('redirect')

  function getRedirectPath(role, uid) {
    if (customRedirect) return customRedirect;
    
    if (role === 'admin') return '/admin/onboarding';
    if (role === 'doctor') return `/doctor/${uid}/dashboard`;
    if (role === 'receptionist') return '/receptionist';
    return '/patient/profile';
  }

  async function submit(event) {
    event.preventDefault()
    setLocalError('')
    clearError()
    setIsSubmitting(true)
    try {
      let authResult;
      if (mode === 'signin') {
        authResult = await signIn(email, password)
      } else {
        const cleanEmail = email.trim().toLowerCase();
        const domain = cleanEmail.split('@')[1];
        
        // Prohibit signup from clinic domains
        const clinicDomains = ['aarogya.in', 'admin.aarogya.in', 'reception.aarogya.in', 'clinicadmin.in', 'clinicdoctor.in', 'clinicreception.in'];
        if (domain && (clinicDomains.includes(domain) || domain.endsWith('.aarogya.in'))) {
          throw new Error('Sign-up is not allowed for clinic domains.');
        }
        
        authResult = await signUp(cleanEmail, password)
      }
      
      // Fetch role from backend /api/auth/me
      const response = await api.get('/api/auth/me')
      const role = response.data.user?.role || 'patient'
      const doctorId = response.data.user?.doctorId
      
      const path = getRedirectPath(role, doctorId || authResult.user.uid);
      navigate(path, { replace: true, state: location.state?.bookingState })
    } catch (submitError) {
      setLocalError(submitError?.message || 'Could not complete request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function googleSignIn() {
    setLocalError('')
    clearError()
    setIsSubmitting(true)
    try {
      const authResult = await signInWithGoogle()
      // Fetch role from backend /api/auth/me
      const response = await api.get('/api/auth/me')
      const role = response.data.user?.role || 'patient'
      const doctorId = response.data.user?.doctorId
      
      const path = getRedirectPath(role, doctorId || authResult.user.uid);
      navigate(path, { replace: true, state: location.state?.bookingState })
    } catch (googleError) {
      setLocalError(googleError?.message || 'Google sign-in failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 text-center">
        <Link to="/" className="text-xl font-bold text-emerald-700">
          Aarogya
        </Link>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access the clinic dashboard
        </p>
      </div>

      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex rounded-md bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-md px-3 py-2 ${
              mode === 'signin' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-md px-3 py-2 ${
              mode === 'signup' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
            }`}
          >
            Create account
          </button>
        </div>

        {!hasFirebaseConfig ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Firebase is not configured for this environment. Set the
            <code className="mx-1 rounded bg-amber-100 px-1">VITE_FIREBASE_*</code>
            variables in <code className="rounded bg-amber-100 px-1">frontend/.env</code> and enable
            Email/Password and Google sign-in providers in the Firebase console to use live auth.
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength="6"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {(localError || error) ? (
                <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {localError || error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting
                  ? 'Please wait...'
                  : mode === 'signin'
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={googleSignIn}
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.47 0 11.92-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </span>
            </button>
          </>
        )}
      </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-700">Back to home</Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default LoginPage