import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, hasFirebaseConfig } from '../services/firebase'
import api from '../services/api'

const AuthContext = createContext(null)

const LOCAL_KEY = 'aarogya-auth'

// In dev without Firebase configured, users can still explore the staff demo
// (PIN gate on ReceptionistPage), so auth is treated as optional here.
function useFirebaseAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hasFirebaseConfig) {
      // Restore any cached dev session so refresh does not boot the doctor out.
      const cached = sessionStorage.getItem(LOCAL_KEY)
      const cachedProfile = cached ? (() => { try { return JSON.parse(cached) } catch { return null } })() : null
      const unsubscribe = () => {}
      requestAnimationFrame(() => {
        if (cachedProfile) setUser(cachedProfile)
        setIsLoading(false)
      })
      return unsubscribe
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'patient';
        let apiUser = null;
        try {
          // Verify with backend to get the assigned role based on email domain
          const response = await api.get('/api/auth/me');
          apiUser = response.data.user;
          role = apiUser?.role || 'patient';
        } catch (apiError) {
          console.error("Failed to fetch user role from backend", apiError);
        }

        const profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: apiUser?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Clinician'),
          photoURL: firebaseUser.photoURL,
          role: role,
          doctorId: apiUser?.doctorId || null,
          hospitalId: apiUser?.hospitalId || null,
        }
        setUser(profile)
        sessionStorage.setItem(LOCAL_KEY, JSON.stringify(profile))
      } else {
        setUser(null)
        sessionStorage.removeItem(LOCAL_KEY)
      }
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  async function signIn(email, password) {
    setError('')
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (signInError) {
      setError(translateAuthError(signInError))
      throw signInError
    }
  }

  async function signUp(email, password) {
    setError('')
    try {
      return await createUserWithEmailAndPassword(auth, email, password)
    } catch (signUpError) {
      setError(translateAuthError(signUpError))
      throw signUpError
    }
  }

  async function signInWithGoogle() {
    setError('')
    try {
      return await signInWithPopup(auth, googleProvider)
    } catch (googleError) {
      setError(translateAuthError(googleError))
      throw googleError
    }
  }

  async function signOut() {
    if (hasFirebaseConfig) {
      await firebaseSignOut(auth)
    }
    sessionStorage.removeItem(LOCAL_KEY)
    setUser(null)
  }

  function clearError() {
    setError('')
  }

  return { user, isLoading, error, signIn, signUp, signInWithGoogle, signOut, clearError }
}

function AuthProvider({ children }) {
  const value = useFirebaseAuth()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // Allow components to render before provider mounts without throwing.
    return { user: null, isLoading: true, error: '', signOut: () => {}, clearError: () => {} }
  }
  return ctx
}

function translateAuthError(error) {
  const code = error?.code || ''
  const map = {
    'auth/invalid-email': 'That email address is not valid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account already exists with that email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled for this Firebase project.',
    'auth/too-many-requests': 'Too many attempts. Try again in a moment.',
    'auth/network-request-failed': 'Network error. Check your connection and retry.',
  }
  return map[code] || error?.message || 'Authentication failed. Please try again.'
}

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth }