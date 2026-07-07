import api from './api'

export function getDoctorProfile(id) {
  return api.get(`/api/doctors/${id}`).then((response) => response.data)
}

export function getDoctorSlots(id) {
  return api.get(`/api/doctors/${id}/slots`).then((response) => response.data)
}

export function getDoctorDashboard(id) {
  return api.get(`/api/doctors/${id}/dashboard`).then((response) => response.data)
}

export function listDoctors() {
  return api.get('/api/doctors').then((response) => response.data)
}

export function updateDoctorProfile(id, payload) {
  return api.put(`/api/doctors/${id}`, payload).then((response) => response.data)
}
