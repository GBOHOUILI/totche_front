import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MapPin, Calendar, Briefcase, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/prestataire', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/prestataire/sites', label: 'Mes Sites', icon: MapPin },
  { to: '/prestataire/evenements', label: 'Mes Événements', icon: Calendar },
  { to: '/prestataire/profil', label: 'Mon Profil', icon: User },
]

export default function PrestataireLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnecté')
    navigate('/prestataire/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <Briefcase size={18} />
          <span className="admin-sidebar__title">Totché</span>
          <span className="admin-sidebar__badge">Pro</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-avatar">
              {user?.nom_entreprise?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="admin-user-info">
              <strong>{user?.nom_entreprise}</strong>
              <span>{user?.email || 'Prestataire'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-sidebar__logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
