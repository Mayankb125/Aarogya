import api from './api'

export function searchBookings(query = '') {
  return api
    .get('/api/bookings', { params: { q: query } })
    .then((response) => response.data)
}

export function listPendingBookings() {
  return api.get('/api/bookings/pending').then((response) => response.data)
}

export function createBooking(payload) {
  return api.post('/api/bookings', payload).then((response) => response.data)
}

export function getBookingDetail(id) {
  return api.get(`/api/bookings/${id}`).then((response) => response.data)
}

export function confirmBooking(id) {
  return api.post(`/api/bookings/${id}/confirm`).then((response) => response.data)
}

export function confirmArrival(id) {
  return api.post(`/api/bookings/${id}/arrive`).then((response) => response.data)
}
