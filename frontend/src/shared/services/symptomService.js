import api from './api'

export function searchSymptoms(query = '') {
  return api
    .get('/api/symptoms', { params: { q: query } })
    .then((response) => response.data)
}
