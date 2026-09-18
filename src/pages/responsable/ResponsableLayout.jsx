import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClipboardCheck, ShieldCheck, MapPin, Calendar, LogOut, Hotel, UtensilsCrossed, Bus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/responsable', label: 'À valider', icon: ClipboardCheck, end: true },
  { to: '/responsable/sites', label: 'Mes Sites', icon: MapPin },
  { to: '/responsable/evenements', label: 'Mes Événements', icon: Calendar },
  { to: '/responsable/hotels', label: 'Mes Hôtels', icon: Hotel },
  { to: '/responsable/restaurants', label: 'Mes Restaurants', icon: UtensilsCrossed },
  { to: '/responsable/transports', label: 'Mes Transports', icon: Bus },
]

export default function ResponsableLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnecté')
    navigate('/responsable/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <ShieldCheck size={18} />
          <span className="admin-sidebar__title">Totché</span>
          <span className="admin-sidebar__badge">Responsable</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-avatar">
              {user?.nom?.[0]?.toUpperCase() || 'R'}
            </div>
            <div className="admin-user-info">
              <strong>{user?.nom} {user?.prenom}</strong>
              <span>{user?.region?.nom || 'Toutes régions'}</span>
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
