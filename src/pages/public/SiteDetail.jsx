import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { sitesApi, prixApi, reservationsApi } from '../../api/services'
import { Stars, Spinner } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function SiteDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [site, setSite] = useState(null)
  const [prix, setPrix] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [showReservation, setShowReservation] = useState(false)
  const [reservation, setReservation] = useState({ nombre: 1, prix: 0, selectedPrix: null })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      sitesApi.get(id),
      prixApi.list({ id_site: id })
    ]).then(([s, p]) => {
      setSite(s.data?.data || s.data)
      setPrix(p.data?.data || p.data || [])
    }).finally(() => setLoading(false))
  }, [id])

  const submitReservation = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return toast.error('Connectez-vous pour réserver')
    if (!reservation.selectedPrix && prix.length > 0) return toast.error('Choisissez un tarif')
    try {
      await reservationsApi.create({
        type: 'site',
        id_site: parseInt(id),
        prix: reservation.prix,
        nombre: parseInt(reservation.nombre),
      })
      toast.success('Réservation effectuée ! Vos tickets sont disponibles dans votre espace.')
      setShowReservation(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation')
    }
  }

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>
  if (!site) return <div className="container page-error"><p>Site introuvable.</p></div>

  const images = site.galeries || []

  return (
    <div className="page-detail">
      {/* Hero */}
      <div className="detail-hero">
        {images.length > 0 ? (
          <>
            <img src={images[imgIdx]?.url_fichier || images[imgIdx]?.url} alt={site.libelle} className="detail-hero__img" />
            {images.length > 1 && (
              <>
                <button className="detail-hero__nav detail-hero__nav--prev" onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}><ChevronLeft size={24} /></button>
                <button className="detail-hero__nav detail-hero__nav--next" onClick={() => setImgIdx(i => (i + 1) % images.length)}><ChevronRight size={24} /></button>
                <div className="detail-hero__dots">
                  {images.map((_, i) => <button key={i} className={`hero__dot${i === imgIdx ? ' hero__dot--active' : ''}`} onClick={() => setImgIdx(i)} />)}
                </div>
              </>
            )}
          </>
        ) : <div className="detail-hero__placeholder" />}
        <div className="detail-hero__overlay" />
        <div className="detail-hero__info">
          <h1>{site.libelle}</h1>
          <div className="detail-hero__meta">
            {site.adresse && <span><MapPin size={14} /> {site.adresse}</span>}
            {site.ouverture && <span><Clock size={14} /> {site.ouverture} – {site.fermeture}</span>}
            {site.categorie && <span>{site.categorie.libelle}</span>}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          {/* Contenu principal */}
          <div className="detail-main">
            <section className="detail-section">
              <h2>Description</h2>
              <p className="detail-description">{site.description || 'Aucune description disponible.'}</p>
            </section>

            {/* Galerie thumbnails */}
            {images.length > 1 && (
              <section className="detail-section">
                <h2>Galerie</h2>
                <div className="detail-gallery">
                  {images.map((img, i) => (
                    <button key={i} className={`detail-gallery__thumb${i === imgIdx ? ' detail-gallery__thumb--active' : ''}`} onClick={() => setImgIdx(i)}>
                      <img src={img.url_fichier || img.url} alt={`${site.libelle} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Événements associés */}
            {site.evenements?.length > 0 && (
              <section className="detail-section">
                <h2>Événements à ce site</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {site.evenements.map(evt => (
                    <Link key={evt.id} to={`/evenements/${evt.id}`} className="detail-nearby-item">
                      <div className="detail-nearby-img">
                        {evt.galeries?.[0] && <img src={evt.galeries[0].url_fichier || evt.galeries[0].url} alt={evt.libelle} />}
                      </div>
                      <div>
                        <strong>{evt.libelle}</strong>
                        <span>{evt.date_debut ? new Date(evt.date_debut).toLocaleDateString('fr-FR') : ''}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="detail-card">
              <h3>Réservation</h3>

              {/* Tarifs */}
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
                      <select
                        required
                        value={reservation.selectedPrix || ''}
                        onChange={e => {
                          const p = prix.find(x => x.id === parseInt(e.target.value))
                          setReservation(r => ({ ...r, selectedPrix: p?.id, prix: p?.montant || 0 }))
                        }}
                      >
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

            {/* Infos pratiques */}
            {(site.ouverture || site.adresse) && (
              <div className="detail-card">
                <h3>Infos pratiques</h3>
                {site.adresse && <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.5rem' }}><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />{site.adresse}</p>}
                {site.ouverture && <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />Ouvert de {site.ouverture} à {site.fermeture}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
