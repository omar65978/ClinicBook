import { Link } from 'react-router-dom'

function initials(name) {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <div className="doctor-avatar" aria-hidden="true">{initials(doctor.name)}</div>
      <h3 className="doctor-name">{doctor.name}</h3>
      <p className="doctor-specialty">{doctor.specialty}</p>
      {doctor.bio && <p className="doctor-bio">{doctor.bio}</p>}
      <Link to={`/doctors/${doctor.id}`} className="btn btn-primary btn-sm">
        Book appointment
      </Link>
    </article>
  )
}
