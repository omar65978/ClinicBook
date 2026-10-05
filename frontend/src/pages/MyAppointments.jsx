import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import StatusPill from '../components/StatusPill.jsx'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.myAppointments()
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

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await api.cancelAppointment(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div>
      <h1 className="page-title">My appointments</h1>
      {error && <div className="alert">{error}</div>}
      {appointments.length === 0 ? (
        <div className="empty">
          <p>You have no appointments yet.</p>
          <p className="muted"><Link to="/">Find a doctor</Link> and book your first visit.</p>
        </div>
      ) : (
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <article key={appointment.id} className={`appointment-card status-${appointment.status}`}>
              <div className="appointment-when">
                <span className="appointment-date">{appointment.appointment_date}</span>
                <span className="appointment-time">{appointment.appointment_time}</span>
              </div>
              <div className="appointment-info">
                <strong>{appointment.doctor?.name}</strong>
                <span className="appointment-specialty">{appointment.doctor?.specialty}</span>
                {appointment.reason && <span className="appointment-reason">{appointment.reason}</span>}
              </div>
              <div className="appointment-side">
                <StatusPill status={appointment.status} />
                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                  <button className="btn btn-ghost btn-sm" onClick={() => cancel(appointment.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
