import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { notificationsApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

// Partagé par les 4 types de comptes (touriste, admin, prestataire,
// responsable) - un seul composant, le rôle vient d'AuthContext (détermine
// le préfixe d'URL, cf. services.js) et l'API se charge déjà de ne renvoyer
// que les notifications du compte connecté (cf. NotificationController). La
// position du menu se calcule au clic (getBoundingClientRect + position
// fixed) plutôt qu'en CSS pur : le bouton vit tantôt dans une sidebar
// sombre étroite (240px), tantôt dans une navbar publique large - un
// positionnement relatif classique déborderait de la sidebar.
export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const role = user?.role || 'user'
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [style, setStyle] = useState({})
  const wrapperRef = useRef(null)
  const btnRef = useRef(null)
  const navigate = useNavigate()

  const chargerCompteur = useCallback(() => {
    if (! isAuthenticated) return
    notificationsApi.nonLues(role).then(r => setNombre(r.data?.nombre || 0)).catch(() => {})
  }, [role, isAuthenticated])

  useEffect(() => {
    if (! isAuthenticated) return
    chargerCompteur()
    const interval = setInterval(chargerCompteur, 60000)
    return () => clearInterval(interval)
  }, [chargerCompteur, isAuthenticated])

  useEffect(() => {
    const surClicExterieur = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', surClicExterieur)
    return () => document.removeEventListener('mousedown', surClicExterieur)
  }, [])

  const ouvrir = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 320 - 16),
      })
      setLoading(true)
      notificationsApi.list(role).then(r => setNotifications(r.data?.data || r.data || [])).finally(() => setLoading(false))
    }
    setOpen(o => !o)
  }

  const clicNotification = async (n) => {
    if (!n.lu) {
      notificationsApi.marquerLu(role, n.id).catch(() => {})
      setNotifications(list => list.map(x => x.id === n.id ? { ...x, lu: true } : x))
      setNombre(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (n.lien) navigate(n.lien)
  }

  const toutMarquer = async (e) => {
    e.stopPropagation()
    await notificationsApi.marquerToutesLues(role).catch(() => {})
    setNotifications(list => list.map(x => ({ ...x, lu: true })))
    setNombre(0)
  }

  if (! isAuthenticated) return null

  return (
    <div className="notif-bell" ref={wrapperRef}>
      <button type="button" ref={btnRef} className="notif-bell__btn" onClick={ouvrir} aria-label="Notifications">
        <Bell size={18} />
        {nombre > 0 && <span className="notif-bell__badge">{nombre > 9 ? '9+' : nombre}</span>}
      </button>

      {open && (
        <div className="notif-bell__dropdown" style={style}>
          <div className="notif-bell__header">
            <strong>Notifications</strong>
            {notifications.some(n => !n.lu) && (
              <button type="button" onClick={toutMarquer}>Tout marquer comme lu</button>
            )}
          </div>
          <div className="notif-bell__list">
            {loading ? (
              <p className="notif-bell__empty">Chargement...</p>
            ) : notifications.length === 0 ? (
              <p className="notif-bell__empty">Aucune notification.</p>
            ) : notifications.map(n => (
              <button
                type="button"
                key={n.id}
                className={`notif-bell__item${n.lu ? '' : ' notif-bell__item--non-lu'}`}
                onClick={() => clicNotification(n)}
              >
                <strong>{n.titre}</strong>
                <p>{n.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
