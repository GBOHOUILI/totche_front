import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, User, Menu, X, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setUserMenu(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/sites', label: 'Sites Touristiques' },
    { to: '/evenements', label: 'Événements' },
    { to: '/a-propos', label: 'À Propos' },
    { to: '/contacts', label: 'Contacts' },
  ]

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">T</span>
          <span className="navbar__logo-text">otché</span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'}
                className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__user" onClick={() => setUserMenu(!userMenu)}>
              <div className="navbar__avatar">
                {user?.nom?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              <ChevronDown size={14} />
              {userMenu && (
                <div className="navbar__dropdown">
                  <Link to="/profil" onClick={() => setUserMenu(false)}>Mon profil</Link>
                  <Link to="/mes-reservations" onClick={() => setUserMenu(false)}>Mes réservations</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setUserMenu(false)}>Administration</Link>}
                  <button onClick={handleLogout}>Déconnexion</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/connexion" className="navbar__icon-btn" aria-label="Connexion">
                <User size={18} />
              </Link>
              <Link to="/inscription" className="navbar__btn-participez">Participez</Link>
            </>
          )}

          <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className="navbar__mobile-link"
              onClick={() => setMenuOpen(false)}>{label}</NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/profil" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Mon profil</Link>
              <Link to="/mes-reservations" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Mes réservations</Link>
              {isAdmin && <Link to="/admin" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Administration</Link>}
            </>
          ) : (
            <Link to="/inscription" className="navbar__btn-participez navbar__btn-participez--mobile"
              onClick={() => setMenuOpen(false)}>Participez</Link>
          )}
        </div>
      )}
    </nav>
  )
}
