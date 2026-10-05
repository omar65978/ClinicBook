import { useEffect, useState } from 'react'
import { api } from '../../api.js'
import StatusPill from '../../components/StatusPill.jsx'

const emptyDoctorForm = { name: '', email: '', password: '', specialty: '', bio: '' }

export default function AdminDashboard() {
  const [tab, setTab] = useState('doctors')
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState(emptyDoctorForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const loadDoctors = () =>
    api.adminDoctors().then((d) => setDoctors(d.doctors)).catch((e) => setError(e.message))
  const loadAppointments = () =>
    api.adminAppointments({ status: statusFilter || undefined })
      .then((d) => setAppointments(d.appointments))
      .catch((e) => setError(e.message))
  const loadStats = () =>
    api.adminStats().then(setStats).catch((e) => setError(e.message))

  useEffect(() => {
    if (tab === 'doctors') loadDoctors()
    if (tab === 'appointments') loadAppointments()
    if (tab === 'stats') loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter])

  const submitDoctor = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.adminUpdateDoctor(editingId, payload)
      } else {
        await api.adminCreateDoctor(form)
      }
      setForm(emptyDoctorForm)
      setEditingId(null)
      await loadDoctors()
    } catch (err) {
      setError(err.message)
    }
  }

  const editDoctor = (doctor) => {
    setEditingId(doctor.id)
    setForm({ name: doctor.name, email: doctor.email, password: '', specialty: doctor.specialty || '', bio: doctor.bio || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteDoctor = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.name}? Their appointments will also be removed.`)) return
    try {
      await api.adminDeleteDoctor(doctor.id)
      await loadDoctors()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateAppointmentStatus = async (appointment, status) => {
    try {
      await api.adminUpdateAppointmentStatus(appointment.id, status)
      await loadAppointments()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin">
      <h1 className="page-title">Clinic admin</h1>
      <div className="tabs">
        <button className={`chip ${tab === 'doctors' ? 'chip-active' : ''}`} onClick={() => setTab('doctors')}>Doctors</button>
        <button className={`chip ${tab === 'appointments' ? 'chip-active' : ''}`} onClick={() => setTab('appointments')}>Appointments</button>
        <button className={`chip ${tab === 'stats' ? 'chip-active' : ''}`} onClick={() => setTab('stats')}>Stats</button>
      </div>
      {error && <div className="alert">{error}</div>}

      {tab === 'doctors' && (
        <div className="admin-grid">
          <form className="panel form" onSubmit={submitDoctor}>
            <h2 className="panel-title">{editingId ? 'Edit doctor' : 'New doctor'}</h2>
            <label className="field">
              <span>Name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Doe" />
            </label>
            <label className="field">
              <span>Email</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="field">
              <span>{editingId ? 'New password (leave empty to keep)' : 'Password'}</span>
              <input
                type="password"
                {...(editingId ? {} : { required: true })}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Specialty</span>
              <input required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Cardiology" />
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary">{editingId ? 'Save changes' : 'Create doctor'}</button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(emptyDoctorForm) }}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="admin-row">
                <div>
                  <strong>{doctor.name}</strong>
                  <span className="admin-row-meta">{doctor.specialty} · {doctor.email}</span>
                </div>
                <div className="admin-row-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => editDoctor(doctor)}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteDoctor(doctor)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          <div className="filter-row">
            <div className="chips">
              {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s || 'all'}
                  className={`chip ${statusFilter === s ? 'chip-active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="appointment-list">
            {appointments.length === 0 && <p className="muted">No appointments found.</p>}
            {appointments.map((appointment) => (
              <article key={appointment.id} className={`appointment-card status-${appointment.status}`}>
                <div className="appointment-when">
                  <span className="appointment-date">{appointment.appointment_date}</span>
                  <span className="appointment-time">{appointment.appointment_time}</span>
                </div>
                <div className="appointment-info">
                  <strong>{appointment.patient?.name}</strong>
                  <span className="appointment-specialty">with {appointment.doctor?.name} · {appointment.doctor?.specialty}</span>
                  {appointment.reason && <span className="appointment-reason">{appointment.reason}</span>}
                </div>
                <div className="appointment-side">
                  <StatusPill status={appointment.status} />
                  <select
                    value={appointment.status}
                    onChange={(e) => updateAppointmentStatus(appointment, e.target.value)}
                    aria-label="Update status"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Appointments today</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.doctors}</span>
            <span className="stat-label">Doctors</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.patients}</span>
            <span className="stat-label">Patients</span>
          </div>
        </div>
      )}
    </div>
  )
}
