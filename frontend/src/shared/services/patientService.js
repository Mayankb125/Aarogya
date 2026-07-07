import api from './api'

export function getPatientProfile(id) {
  return api.get(`/api/patients/${id}`).then((response) => response.data)
}

export function getMyPatientProfile() {
  return api.get('/api/patients/me').then((response) => response.data)
}

export function saveMyPatientProfile(payload) {
  return api
    .post('/api/patients/me', payload)
    .then((response) => response.data)
}

export function updateMyPatientProfile(payload) {
  return api
    .put('/api/patients/me', payload)
    .then((response) => response.data)
}

export function addConsultation(patientId, payload) {
  return api
    .post(`/api/patients/${patientId}/consultations`, payload)
    .then((response) => response.data)
}

export function addReminder(patientId, payload) {
  return api
    .post(`/api/patients/${patientId}/reminders`, payload)
    .then((response) => response.data)
}

export function completeReminder(patientId, reminderId) {
  return api
    .patch(`/api/patients/${patientId}/reminders/${reminderId}`)
    .then((response) => response.data)
}