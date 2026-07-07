import api from './api'

const HOSPITALS = '/api/admin/hospitals'
const DOCTORS = '/api/admin/doctors'

export function listHospitals() {
  return api.get(HOSPITALS).then((response) => response.data)
}

export function createHospital(payload) {
  return api.post(HOSPITALS, payload).then((response) => response.data)
}

export function updateHospital(id, payload) {
  return api.put(`${HOSPITALS}/${id}`, payload).then((response) => response.data)
}

export function deleteHospital(id) {
  return api.delete(`${HOSPITALS}/${id}`).then((response) => response.data)
}

export function listDoctors() {
  return api.get(DOCTORS).then((response) => response.data)
}

export function createDoctor(payload) {
  return api.post(DOCTORS, payload).then((response) => response.data)
}

export function updateDoctor(id, payload) {
  return api.put(`${DOCTORS}/${id}`, payload).then((response) => response.data)
}

export function deleteDoctor(id) {
  return api.delete(`${DOCTORS}/${id}`).then((response) => response.data)
}
