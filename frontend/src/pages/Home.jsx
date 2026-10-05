import { useEffect, useState } from 'react'
import { api } from '../api.js'
import DoctorCard from '../components/DoctorCard.jsx'

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.doctors({ specialty: specialty || undefined })
      .then((data) => setDoctors(data.doctors))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [specialty])

  const specialties = [...new Set(doctors.map((d) => d.specialty).filter(Boolean))]

  return (
    <div>
      <section className="hero">
        <p className="hero-kicker">ClinicBook · online booking</p>
        <h1 className="hero-title">Your doctor, one tap away.</h1>
        <p className="hero-sub">
          Browse our specialists and book a visit in under a minute — no phone calls needed.
        </p>
      </section>

      <div className="filter-row">
        <div className="chips">
          <button
            className={`chip ${specialty === '' ? 'chip-active' : ''}`}
            onClick={() => setSpecialty('')}
          >
            All specialties
          </button>
          {specialties.map((s) => (
            <button
              key={s}
              className={`chip ${specialty === s ? 'chip-active' : ''}`}
              onClick={() => setSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading doctors…</p>
      ) : doctors.length === 0 ? (
        <div className="empty"><p>No doctors found for this specialty.</p></div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  )
}
