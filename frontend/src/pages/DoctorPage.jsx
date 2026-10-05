import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

const today = () => new Date().toISOString().slice(0, 10)

export default function DoctorPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ date: '', time: '', reason: '' })
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(null)

  useEffect(() => {
    api.doctor(id)
      .then((data) => setDoctor(data.doctor))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    setBooking(true)
    setError('')
    try {
      const data = await api.bookAppointment({
        doctor_id: Number(id),
        appointment_date: form.date,
        appointment_time: form.time,
        reason: form.reason || null,
      })
      setBooked(data.appointment)
    } catch (err) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <p className="muted">Loading…</p>
  if (!doctor) return <div className="alert">{error || 'Doctor not found.'}</div>

  return (
    <div className="doctor-page">
      <Link to="/" className="back-link">All doctors</Link>
      <div className="doctor-page-grid">
        <div className="doctor-profile panel">
          <div className="doctor-avatar doctor-avatar-lg" aria-hidden="true">
            {doctor.name.replace(/^Dr\.\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')}
          </div>
          <h1 className="doctor-page-name">{doctor.name}</h1>
          <p className="doctor-specialty">{doctor.specialty}</p>
          {doctor.bio && <p className="doctor-bio">{doctor.bio}</p>}
        </div>

        <div>
          {!user && (
            <div className="notice">
              Please <Link to="/login">log in</Link> or <Link to="/register">create an account</Link> to book a visit.
            </div>
          )}
          {booked ? (
            <div className="panel booking-success">
              <h2 className="panel-title">Appointment requested</h2>
              <p>
                {booked.appointment_date} at {booked.appointment_time} with {booked.doctor?.name}.
              </p>
              <p className="muted">
                Status: <strong>{booked.status}</strong> — the clinic will confirm your visit.
              </p>
              <Link to="/my-appointments" className="btn btn-primary">View my appointments</Link>
            </div>
          ) : (
            <form className="panel form" onSubmit={submit}>
              <h2 className="panel-title">Book an appointment</h2>
              {error && <div className="alert">{error}</div>}
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  required
                  min={today()}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Time</span>
                <select
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                >
                  <option value="">Choose a time…</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Reason (optional)</span>
                <textarea
                  rows="3"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Briefly describe your symptoms…"
                />
              </label>
              <div>
                <button className="btn btn-primary" disabled={booking || !user}>
                  {booking ? 'Booking…' : 'Request appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
