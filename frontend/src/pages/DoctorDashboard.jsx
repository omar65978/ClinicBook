import { useEffect, useState } from 'react'
import { api } from '../api.js'
import StatusPill from '../components/StatusPill.jsx'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.doctorSchedule()
      setAppointments(data.appointments)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (appointment, status) => {
    try {
      await api.updateAppointmentStatus(appointment.id, status)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="muted">Loading schedule…</p>

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed')
  const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled')

  return (
    <div>
      <h1 className="page-title">My schedule</h1>
      {error && <div className="alert">{error}</div>}

      <h2 className="section-title">Upcoming ({upcoming.length})</h2>
      {upcoming.length === 0 && <p className="muted">No upcoming appointments.</p>}
      <div className="appointment-list">
        {upcoming.map((appointment) => (
          <article key={appointment.id} className={`appointment-card status-${appointment.status}`}>
            <div className="appointment-when">
              <span className="appointment-date">{appointment.appointment_date}</span>
              <span className="appointment-time">{appointment.appointment_time}</span>
            </div>
            <div className="appointment-info">
              <strong>{appointment.patient?.name}</strong>
              {appointment.reason && <span className="appointment-reason">{appointment.reason}</span>}
            </div>
            <div className="appointment-side">
              <StatusPill status={appointment.status} />
              <select
                value={appointment.status}
                onChange={(e) => updateStatus(appointment, e.target.value)}
                aria-label="Update status"
              >
                <option value="confirmed">Confirm</option>
                <option value="completed">Mark completed</option>
              </select>
            </div>
          </article>
        ))}
      </div>

      <h2 className="section-title">History ({past.length})</h2>
      {past.length === 0 && <p className="muted">No past appointments.</p>}
      <div className="appointment-list">
        {past.map((appointment) => (
          <article key={appointment.id} className={`appointment-card status-${appointment.status}`}>
            <div className="appointment-when">
              <span className="appointment-date">{appointment.appointment_date}</span>
              <span className="appointment-time">{appointment.appointment_time}</span>
            </div>
            <div className="appointment-info">
              <strong>{appointment.patient?.name}</strong>
              {appointment.reason && <span className="appointment-reason">{appointment.reason}</span>}
            </div>
            <div className="appointment-side">
              <StatusPill status={appointment.status} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
