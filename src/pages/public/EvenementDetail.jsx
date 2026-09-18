import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { evenementsApi, prixApi, reservationsApi, avisApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function EvenementDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [prix, setPrix] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [showReservation, setShowReservation] = useState(false)
  const [reservation, setReservation] = useState({ nombre: 1, prix: 0, selectedPrix: null })

  const [avisList, setAvisList] = useState([])
  const [reviewableReservation, setReviewableReservation] = useState(null)
  const [avisMessage, setAvisMessage] = useState('')
  const [avisSubmitting, setAvisSubmitting] = useState(false)
  const [avisJustSubmitted, setAvisJustSubmitted] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([evenementsApi.get(id), prixApi.list({ id_evnmt: id })])
      .then(([e, p]) => {
        setEvent(e.data?.data || e.data)
        setPrix(p.data?.data || p.data || [])
      }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    avisApi.list({ id_evnmt: id, status: 'approuve' })
      .then(r => setAvisList(r.data?.data || r.data || []))
      .catch(() => {})
  }, [id])

  // Cf. SiteDetail.jsx : un avis se rattache à une réservation confirmee,
  // pas à un flux de visite scannée séparé. Ré-appelé après une réservation
  // réussie (résa gratuite confirmee immédiatement) pour éviter un reload.
  const refreshReviewable = () => {
    if (!isAuthenticated) { setReviewableReservation(null); return }
    reservationsApi.list({ id_evnmt: id }).then(r => {
      const reservations = r.data?.data || r.data || []
      const candidate = reservations.find(res => res.statut === 'confirmee' && !res.avis)
      setReviewableReservation(candidate || null)
    }).catch(() => {})
  }

  useEffect(refreshReviewable, [id, isAuthenticated])

  const submitAvis = async (e) => {
    e.preventDefault()
    if (!reviewableReservation || !avisMessage.trim()) return
    setAvisSubmitting(true)
    try {
      await avisApi.create({ id_reservation: reviewableReservation.id, message: avisMessage.trim() })
      toast.success('Merci ! Votre avis sera visible après modération.')
      setAvisJustSubmitted(true)
      setAvisMessage('')
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'avis")
    } finally { setAvisSubmitting(false) }
  }

  const submitReservation = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return toast.error('Connectez-vous pour réserver')
    try {
      await reservationsApi.create({
        type: 'evenement',
        id_evnmt: parseInt(id),
        prix: reservation.prix,
        nombre: parseInt(reservation.nombre),
      })
      toast.success('Réservation effectuée !')
      setShowReservation(false)
      refreshReviewable()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation')
    }
  }

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>
  if (!event) return <div className="container page-error"><p>Événement introuvable.</p></div>

  const images = event.galeries || []
  const dateDebut = event.date_debut ? new Date(event.date_debut) : null
  const dateFin = event.date_fin ? new Date(event.date_fin) : null

  return (
    <div className="page-detail">
      <div className="detail-hero">
        {images.length > 0 ? (
          <>
            <img src={images[imgIdx]?.url_fichier || images[imgIdx]?.url} alt={event.libelle} className="detail-hero__img" />
            {images.length > 1 && (
              <>
                <button className="detail-hero__nav detail-hero__nav--prev" onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}><ChevronLeft size={24} /></button>
                <button className="detail-hero__nav detail-hero__nav--next" onClick={() => setImgIdx(i => (i + 1) % images.length)}><ChevronRight size={24} /></button>
              </>
            )}
          </>
        ) : <div className="detail-hero__placeholder detail-hero__placeholder--event" />}
        <div className="detail-hero__overlay" />
        <div className="detail-hero__info">
          <h1>{event.libelle}</h1>
          <div className="detail-hero__meta">
            {event.adresse && <span><MapPin size={14} /> {event.adresse}</span>}
            {dateDebut && (
              <span><Calendar size={14} />
                {dateDebut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                {dateFin && ` → ${dateFin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-section">
              <h2>Description</h2>
              <p className="detail-description">{event.description || 'Aucune description disponible.'}</p>
            </section>

            {images.length > 1 && (
              <section className="detail-section">
                <h2>Galerie</h2>
                <div className="detail-gallery">
                  {images.map((img, i) => (
                    <button key={i} className={`detail-gallery__thumb${i === imgIdx ? ' detail-gallery__thumb--active' : ''}`} onClick={() => setImgIdx(i)}>
                      <img src={img.url_fichier || img.url} alt={`${event.libelle} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Avis */}
            <section className="detail-section">
              <h2>Avis des visiteurs</h2>
              {avisList.length === 0 ? (
                <p className="detail-description" style={{ color: 'var(--gray-500)' }}>Aucun avis pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {avisList.map(a => (
                    <div key={a.id} style={{ borderLeft: '3px solid var(--red)', paddingLeft: '1rem' }}>
                      <strong>{a.reservation?.user?.prenom} {a.reservation?.user?.nom}</strong>
                      <p style={{ color: 'var(--gray-700)', marginTop: '0.25rem' }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {reviewableReservation && !avisJustSubmitted && (
                <form onSubmit={submitAvis} style={{ marginTop: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gray-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Vous avez participé à cet événement — laissez un avis
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={avisMessage}
                    onChange={e => setAvisMessage(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    style={{ width: '100%', marginBottom: '0.75rem' }}
                  />
                  <button type="submit" className="btn btn--primary" disabled={avisSubmitting}>
                    {avisSubmitting ? 'Envoi...' : "Envoyer l'avis"}
                  </button>
                </form>
              )}
              {avisJustSubmitted && (
                <p style={{ marginTop: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Votre avis a été envoyé et sera visible après modération.
                </p>
              )}
            </section>
          </div>

          <div className="detail-sidebar">
            <div className="detail-card">
              <h3>Réservation</h3>
              {prix.length > 0 && (
                <div className="detail-prix">
                  {prix.map(p => (
                    <div key={p.id} className="detail-prix__item">
                      <span>{p.libelle}</span>
                      <strong>{Number(p.montant).toLocaleString('fr-FR')} FCFA</strong>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn--primary btn--full" onClick={() => setShowReservation(!showReservation)}>
                {showReservation ? 'Annuler' : 'RÉSERVER'}
              </button>
              {showReservation && (
                <form className="reservation-form" onSubmit={submitReservation}>
                  {prix.length > 0 && (
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--gray-700)', display: 'block', marginBottom: '0.35rem' }}>Tarif</label>
                      <select required value={reservation.selectedPrix || ''}
                        onChange={e => {
                          const p = prix.find(x => x.id === parseInt(e.target.value))
                          setReservation(r => ({ ...r, selectedPrix: p?.id, prix: p?.montant || 0 }))
                        }}>
                        <option value="">Choisir un tarif</option>
                        {prix.map(p => <option key={p.id} value={p.id}>{p.libelle} – {Number(p.montant).toLocaleString()} FCFA</option>)}
                      </select>
                    </div>
                  )}
                  <div className="reservation-form__row">
                    <label>Nombre de personnes</label>
                    <input type="number" min={1} value={reservation.nombre}
                      onChange={e => setReservation(r => ({ ...r, nombre: e.target.value }))} />
                  </div>
                  {reservation.prix > 0 && (
                    <div style={{ background: 'var(--gray-100)', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                      <strong>Total : {(reservation.prix * reservation.nombre).toLocaleString('fr-FR')} FCFA</strong>
                    </div>
                  )}
                  <button type="submit" className="btn btn--primary btn--full">Confirmer</button>
                </form>
              )}
            </div>

            {/* Dates */}
            {dateDebut && (
              <div className="detail-card">
                <h3>Dates</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  Du {dateDebut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {dateFin && <><br />au {dateFin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
