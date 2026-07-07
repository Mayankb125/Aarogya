import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasFirebaseConfig } from '../services/firebase'

// When Firebase is not configured, we cannot gate on a real session. Keep the
// app navigable for local demo instead of locking the doctor view out.
function RequireAuth({ children, allowedRoles }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (!hasFirebaseConfig) {
    return children
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Checking your session...
      </main>
    )
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} state={{ bookingState: location.state }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`User with role "${user.role}" attempted to access route requiring roles: ${allowedRoles}`);
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireAuth