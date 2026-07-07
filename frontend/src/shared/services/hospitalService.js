import api from './api'

export function searchHospitals(params = {}) {
  return api
    .get('/api/hospitals', { params })
    .then((response) => response.data)
}

export function getHospitalDetail(id, specialty = '') {
  return api
    .get(`/api/hospitals/${id}`, { params: { specialty } })
    .then((response) => response.data)
}
