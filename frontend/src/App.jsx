import { Navigate, Route, Routes } from 'react-router-dom'
import AdminOnboardingPage from './pages/AdminOnboardingPage'
import DoctorDashboardPage from './pages/DoctorDashboardPage'
import DoctorProfilePage from './pages/DoctorProfilePage'
import DoctorPatientDetailPage from './pages/DoctorPatientDetailPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PatientOnboardingPage from './pages/PatientOnboardingPage'
import PatientProfilePage from './pages/PatientProfilePage'
import ReceptionistPage from './pages/ReceptionistPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import SearchPage from './discovery/SearchPage'
import HospitalDetail from './discovery/HospitalDetail'
import DoctorProfile from './discovery/DoctorProfile'
import BookingConfirm from './discovery/BookingConfirm'
import BookingSuccess from './discovery/BookingSuccess'
import RequireAuth from './shared/components/RequireAuth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/hospital/:id" element={<HospitalDetail />} />
      <Route path="/doctor/:id" element={<DoctorProfile />} />
      <Route
        path="/doctor/:id/dashboard"
        element={
          <RequireAuth allowedRoles={['doctor']}>
            <DoctorDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/doctor/:id/profile"
        element={
          <RequireAuth allowedRoles={['doctor']}>
            <DoctorProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/doctor/:id/patient/:patientId"
        element={
          <RequireAuth allowedRoles={['doctor']}>
            <DoctorPatientDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/patient/onboarding"
        element={
          <RequireAuth allowedRoles={['patient']}>
            <PatientOnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <RequireAuth allowedRoles={['patient']}>
            <PatientProfilePage />
          </RequireAuth>
        }
      />
      <Route path="/booking/confirm" element={<BookingConfirm />} />
      <Route path="/booking/success/:id" element={<BookingSuccess />} />
      <Route
        path="/receptionist"
        element={
          <RequireAuth allowedRoles={['receptionist']}>
            <ReceptionistPage />
          </RequireAuth>
        }
      />
      <Route
        path="/waiting"
        element={
          <RequireAuth>
            <WaitingRoomPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/onboarding"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <AdminOnboardingPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
