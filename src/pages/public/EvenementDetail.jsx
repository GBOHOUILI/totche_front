import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { evenementsApi, prixApi, reservationsApi } from '../../api/services'
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

  useEffect(() => {
    setLoading(true)
    Promise.all([evenementsApi.get(id), prixApi.list({ id_evnmt: id })])
      .then(([e, p]) => {
        setEvent(e.data?.data || e.data)
        setPrix(p.data?.data || p.data || [])
      }).finally(() => setLoading(false))
  }, [id])

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
                    <select required value={reservation.selectedPrix || ''}
                      onChange={e => {
                        const p = prix.find(x => x.id === parseInt(e.target.value))
                        setReservation(r => ({ ...r, selectedPrix: p?.id, prix: p?.montant || 0 }))
                      }}>
                      <option value="">Choisir un tarif</option>
                      {prix.map(p => <option key={p.id} value={p.id}>{p.libelle} – {Number(p.montant).toLocaleString()} FCFA</option>)}
                    </select>
                  )}
                  <div className="reservation-form__row">
                    <label>Nombre de personnes</label>
                    <input type="number" min={1} value={reservation.nombre}
                      onChange={e => setReservation(r => ({ ...r, nombre: e.target.value }))} />
                  </div>
                  {reservation.prix > 0 && (
                    <div style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '0.75rem', fontSize: '0.875rem' }}>
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
