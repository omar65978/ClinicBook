const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function getToken() {
  return localStorage.getItem('clinicbook_token')
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('clinicbook_token', token)
  } else {
    localStorage.removeItem('clinicbook_token')
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`)
    error.status = res.status
    error.errors = data.errors
    throw error
  }
  return data
}

const qs = (params) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const api = {
  register: (payload) => request('/register', { method: 'POST', body: payload }),
  login: (payload) => request('/login', { method: 'POST', body: payload }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),

  doctors: (params = {}) => request(`/doctors${qs(params)}`),
  doctor: (id) => request(`/doctors/${id}`),

  myAppointments: () => request('/appointments'),
  bookAppointment: (payload) => request('/appointments', { method: 'POST', body: payload }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),

  doctorSchedule: () => request('/doctor/appointments'),
  updateAppointmentStatus: (id, status) =>
    request(`/doctor/appointments/${id}/status`, { method: 'PATCH', body: { status } }),

  adminDoctors: () => request('/admin/doctors'),
  adminCreateDoctor: (payload) => request('/admin/doctors', { method: 'POST', body: payload }),
  adminUpdateDoctor: (id, payload) => request(`/admin/doctors/${id}`, { method: 'PUT', body: payload }),
  adminDeleteDoctor: (id) => request(`/admin/doctors/${id}`, { method: 'DELETE' }),
  adminAppointments: (params = {}) => request(`/admin/appointments${qs(params)}`),
  adminUpdateAppointmentStatus: (id, status) =>
    request(`/admin/appointments/${id}/status`, { method: 'PATCH', body: { status } }),
  adminStats: () => request('/admin/stats'),
}
