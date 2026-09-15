import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket, ChevronRight } from 'lucide-react'
import { reservationsApi } from '../../api/services'
import { Spinner, EmptyState } from '../../components/ui/index'

const STATUS_LABEL = { en_attente: 'En attente', confirme: 'Confirmé', annule: 'Annulé', pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' }
const STATUS_COLOR = { en_attente: 'warning', confirme: 'success', annule: 'danger', pending: 'warning', confirmed: 'success', cancelled: 'danger' }

export default function MesReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reservationsApi.list()
      .then(r => setReservations(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-reservations">
      <div className="page-hero page-hero--sm">
        <h1>Mes Réservations</h1>
        <p>Retrouvez tous vos tickets et réservations</p>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        {loading ? (
          <div className="center-spinner"><Spinner size="lg" /></div>
        ) : reservations.length === 0 ? (
          <EmptyState message="Vous n'avez pas encore de réservation" icon={Ticket} />
        ) : (
          <div className="reservations-list">
            {reservations.map(r => {
              const isEvent = !!r.id_evnmt
              const title = r.evenement?.libelle || r.site?.libelle || 'Réservation'
              const address = r.evenement?.adresse || r.site?.adresse
              const date = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null
              const detailPath = isEvent ? `/evenements/${r.id_evnmt}` : `/sites/${r.id_site}`
              const statusKey = r.status || 'en_attente'
              // total = prix * nombre
              const total = r.total || (r.prix && r.nombre ? r.prix * r.nombre : null)

              return (
                <div key={r.id} className="reservation-item">
                  <div className="reservation-item__icon">
                    {isEvent ? <Calendar size={20} /> : <MapPin size={20} />}
                  </div>
                  <div className="reservation-item__info">
                    <h3>{title}</h3>
                    <div className="reservation-item__meta">
                      {address && <span><MapPin size={12} /> {address}</span>}
                      {date && <span><Calendar size={12} /> Réservé le {date}</span>}
                      <span><Ticket size={12} /> {r.nombre || 1} personne{(r.nombre || 1) > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="reservation-item__right">
                    <span className={`status-badge status-badge--${STATUS_COLOR[statusKey] || 'warning'}`}>
                      {STATUS_LABEL[statusKey] || statusKey}
                    </span>
                    {total && (
                      <strong className="reservation-item__price">
                        {Number(total).toLocaleString('fr-FR')} FCFA
                      </strong>
                    )}
                    <Link to={detailPath} className="btn btn--ghost btn--sm">
                      Voir <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
