import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, Calendar, Tag, Ticket,
  Users, Shield, Star, LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/sites', label: 'Sites', icon: MapPin },
  { to: '/admin/evenements', label: 'Événements', icon: Calendar },
  { to: '/admin/categories', label: 'Catégories', icon: Tag },
  { to: '/admin/tarifs', label: 'Tarifs', icon: Ticket },
  { to: '/admin/avis', label: 'Avis', icon: Star },
  { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/admins', label: 'Administrateurs', icon: Shield },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnecté')
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        {/* LOGO */}
        <div className="admin-sidebar__logo">
          <Shield size={18} />
          <span className="admin-sidebar__title">Totché</span>
          <span className="admin-sidebar__badge">Admin</span>
        </div>

        {/* NAV */}
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

        {/* FOOTER USER */}
        <div className="admin-sidebar__footer">

          <div className="admin-sidebar__user">
            <div className="admin-avatar">
              {user?.nom?.[0]?.toUpperCase() || 'A'}
            </div>

            <div className="admin-user-info">
              <strong>
                {user?.nom} {user?.prenom}
              </strong>
              <span>{user?.tel || 'Admin'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="admin-sidebar__logout"
          >
            <LogOut size={16} />
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}