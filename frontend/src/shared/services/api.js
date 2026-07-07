import axios from 'axios'
import { auth, hasFirebaseConfig } from './firebase'

const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the current Firebase ID token to every backend request so protected
// routes (those behind requireFirebaseAuth) accept the call. Falls back
// gracefully when Firebase isn't configured (dev demo) or no user signed in.
api.interceptors.request.use(async (config) => {
  if (hasFirebaseConfig && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    } catch {
      // Ignore token failures — backend will 401 and the UI can redirect to login.
    }
  }
  return config
})

export default api
