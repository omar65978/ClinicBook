import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">ClinicBook</Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Doctors</Link>
          {user?.role === 'patient' && (
            <Link to="/my-appointments" className="nav-link">My appointments</Link>
          )}
          {user?.role === 'doctor' && (
            <Link to="/doctor" className="nav-link">My schedule</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
