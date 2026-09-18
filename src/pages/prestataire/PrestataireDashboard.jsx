import { useState, useEffect } from 'react'
import { MapPin, Calendar, Ticket, TrendingUp } from 'lucide-react'
import { prestatairesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="admin-stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1 }}>{value ?? '-'}</p>
        {sub && <p style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: '0.35rem' }}>{sub}</p>}
      </div>
      <div style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, borderRadius: 'var(--radius)', padding: '0.6rem' }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
)

export default function PrestataireDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    prestatairesApi.dashboard().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="center-spinner"><Spinner /></div>

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Tableau de bord</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Vue d'ensemble de votre activité sur Totché
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={MapPin} label="Mes sites" value={stats?.nombre_sites} color="var(--success)" />
        <StatCard icon={Calendar} label="Mes événements" value={stats?.nombre_evenements} color="var(--red)" />
        <StatCard icon={Ticket} label="Réservations reçues" value={stats?.nombre_reservations}
          color="var(--warning)" sub={`${stats?.reservations_confirmees || 0} confirmée${(stats?.reservations_confirmees || 0) > 1 ? 's' : ''}`} />
        <StatCard icon={TrendingUp} label="Montant confirmé" value={`${Number(stats?.montant_total_confirme || 0).toLocaleString('fr-FR')} FCFA`} color="var(--gray-900)" />
      </div>

      <div className="admin-section">
        <p style={{ color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Gérez vos fiches depuis <strong>Mes Sites</strong> et <strong>Mes Événements</strong> dans le menu à
          gauche. Une nouvelle fiche est créée <strong>inactive</strong> (site) ou <strong>en attente</strong>{' '}
          (événement) en attendant une vérification - elle deviendra visible publiquement une fois validée.
        </p>
      </div>
    </div>
  )
}
