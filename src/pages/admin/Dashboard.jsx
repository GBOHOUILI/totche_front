import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Star, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { sitesApi, evenementsApi, usersApi, avisApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="admin-stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1 }}>{value ?? '—'}</p>
        {sub && <p style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: '0.35rem' }}>{sub}</p>}
      </div>
      <div style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, borderRadius: 'var(--radius)', padding: '0.6rem' }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentSites, setRecentSites] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [pendingAvis, setPendingAvis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      sitesApi.list(),
      evenementsApi.list(),
      usersApi.list(),
      avisApi.list({ status: 'en_attente' }),
      avisApi.list(),
    ]).then(([sites, events, users, avisPending, avisAll]) => {
      const sitesData  = sites.value?.data?.data  || sites.value?.data  || []
      const eventsData = events.value?.data?.data || events.value?.data || []
      const usersData  = users.value?.data?.data  || users.value?.data  || []
      const pendingData = avisPending.value?.data?.data || avisPending.value?.data || []
      const avisTotal   = avisAll.value?.data?.total ?? (avisAll.value?.data?.data?.length ?? 0)

      setStats({
        sites:   Array.isArray(sitesData)  ? sitesData.length  : (sites.value?.data?.total  ?? 0),
        events:  Array.isArray(eventsData) ? eventsData.length : (events.value?.data?.total ?? 0),
        users:   Array.isArray(usersData)  ? usersData.length  : (users.value?.data?.total  ?? 0),
        avis:    avisTotal,
        pending: Array.isArray(pendingData) ? pendingData.length : 0,
      })

      setRecentSites(Array.isArray(sitesData) ? sitesData.slice(0, 5) : [])
      setRecentEvents(Array.isArray(eventsData) ? eventsData.slice(0, 5) : [])
      setPendingAvis(Array.isArray(pendingData) ? pendingData.slice(0, 5) : [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="center-spinner"><Spinner /></div>

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Tableau de bord</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Vue d'ensemble de la plateforme Totché
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={MapPin}   label="Sites touristiques" value={stats?.sites}   color="#3D6B4F" />
        <StatCard icon={Calendar} label="Événements"          value={stats?.events}  color="#B8432E" />
        <StatCard icon={Users}    label="Utilisateurs"        value={stats?.users}   color="#202C46" />
        <StatCard icon={Star}     label="Avis reçus"          value={stats?.avis}    color="#CC9A3A" sub={stats?.pending > 0 ? `${stats.pending} en attente` : 'Aucun en attente'} />
      </div>

      {/* Grille : sites récents + événements récents + avis en attente */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Sites récents */}
        <div className="admin-section">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="#3D6B4F" /> Sites récents
          </h2>
          {recentSites.length === 0
            ? <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '1.5rem 0' }}>Aucun site</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recentSites.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--gray-100)', borderRadius: 'var(--radius)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.libelle}</p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>{s.commune || s.ville || '—'}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>#{s.id}</span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Événements récents */}
        <div className="admin-section">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="#B8432E" /> Événements récents
          </h2>
          {recentEvents.length === 0
            ? <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '1.5rem 0' }}>Aucun événement</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recentEvents.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--gray-100)', borderRadius: 'var(--radius)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.libelle}</p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                        {ev.date_debut ? new Date(ev.date_debut).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                    <span className={`status-badge status-badge--${ev.statut === 'valide' ? 'success' : ev.statut === 'rejete' ? 'danger' : 'warning'}`}>
                      {ev.statut || 'en attente'}
                    </span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Avis en attente — full width si données */}
        {pendingAvis.length > 0 && (
          <div className="admin-section" style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#CC9A3A" /> Avis en attente de modération
              <span style={{ marginLeft: 'auto', background: 'color-mix(in srgb, var(--red) 14%, var(--white))', color: 'var(--red-dark)', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius)' }}>{pendingAvis.length}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {pendingAvis.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'color-mix(in srgb, var(--gold) 12%, var(--white))', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.user?.nom || 'Utilisateur'} — <span style={{ fontWeight: 400, color: 'var(--gray-700)' }}>{a.contenu?.slice(0, 80)}{a.contenu?.length > 80 ? '…' : ''}</span></p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>Note : {'⭐'.repeat(a.note || 0)} · {a.site?.libelle || a.evenement?.libelle || '—'}</p>
                  </div>
                  <a href="/admin/avis" style={{ fontSize: '0.8rem', color: 'var(--red)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Modérer →</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}