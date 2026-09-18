import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket, ChevronRight, CreditCard, QrCode, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { reservationsApi, commandesApi, paiementsApi } from '../../api/services'
import { Spinner, EmptyState } from '../../components/ui/index'
import toast from 'react-hot-toast'

const STATUS_LABEL = { confirmee: 'Confirmé', en_attente_paiement: 'En attente de paiement', annulee: 'Annulé' }
const STATUS_COLOR = { confirmee: 'success', en_attente_paiement: 'warning', annulee: 'danger' }

// Déclenche le widget Kkiapay pour régler une réservation en attente de paiement
// (reservation.statut === 'en_attente_paiement'). Le montant vient du Paiement créé
// côté serveur, jamais d'une valeur saisie/calculée côté client.
function PayerButton({ reservation, onPaid }) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      const { data: commande } = await commandesApi.create([reservation.id])
      const paiement = commande.paiements[0]

      // L'API Kkiapay ne documente pas de removeListener fiable : on ignore
      // simplement tout événement reçu après le premier pour éviter un double traitement.
      let handled = false

      window.addSuccessListener(async (response) => {
        if (handled) return
        handled = true
        try {
          await paiementsApi.verifier(paiement.id, response.transactionId)
          toast.success('Paiement confirmé !')
          onPaid?.()
        } catch {
          toast.error("Paiement reçu par Kkiapay mais pas encore confirmé côté serveur - patientez puis rafraîchissez.")
        }
      })
      window.addFailedListener(() => {
        if (handled) return
        handled = true
        toast.error('Paiement annulé ou échoué.')
      })

      window.openKkiapayWidget({
        amount: Number(paiement.montant),
        key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
        sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true',
        data: String(paiement.id),
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de créer la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn btn--primary btn--sm" onClick={handlePay} disabled={loading}>
      <CreditCard size={14} /> {loading ? '...' : 'Payer'}
    </button>
  )
}

// Affiche le(s) billet(s) électronique(s) d'une réservation : le QR code encode
// simplement ticket.numero, décodé côté staff par le scanner admin qui appelle
// ensuite POST /tickets/verifier (même contrat que la saisie manuelle).
function BilletsModal({ reservation, onClose }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2>Mon billet</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0 0 1rem' }}>
          {reservation.tickets.map(ticket => (
            <div key={ticket.id} style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--gray-100)', border: '1px solid var(--gray-300)' }}>
              <div style={{ background: 'var(--white)', display: 'inline-block', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <QRCodeSVG value={ticket.numero} size={160} />
              </div>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, marginTop: '0.75rem', letterSpacing: '0.05em' }}>
                {ticket.numero}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MesReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [billetsPour, setBilletsPour] = useState(null)

  const load = useCallback(() => {
    reservationsApi.list()
      .then(r => setReservations(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

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
              const statusKey = r.statut || 'confirmee'
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
                    {r.statut === 'en_attente_paiement' && (
                      <PayerButton reservation={r} onPaid={load} />
                    )}
                    {r.statut !== 'en_attente_paiement' && r.tickets?.length > 0 && (
                      <button className="btn btn--primary btn--sm" onClick={() => setBilletsPour(r)}>
                        <QrCode size={14} /> Mon billet
                      </button>
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

      {billetsPour && (
        <BilletsModal reservation={billetsPour} onClose={() => setBilletsPour(null)} />
      )}
    </div>
  )
}
