import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Clock, ChevronLeft, ChevronRight, BedDouble } from 'lucide-react'
import { hotelsApi, avisApi } from '../../api/services'
import { Stars, StarRatingInput, NoteResume, Spinner } from '../../components/ui/index'
import { HighlightsSection, IncludedSection, PracticalInfoSection, FactsCard } from '../../components/detail/EnrichedSections'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function HotelDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  const [avisList, setAvisList] = useState([])
  const [avisMessage, setAvisMessage] = useState('')
  const [avisNote, setAvisNote] = useState(0)
  const [avisSubmitting, setAvisSubmitting] = useState(false)
  const [avisJustSubmitted, setAvisJustSubmitted] = useState(false)

  useEffect(() => {
    setLoading(true)
    hotelsApi.get(id)
      .then(r => setHotel(r.data?.data || r.data))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    avisApi.list({ id_hotel: id, status: 'approuve' })
      .then(r => setAvisList(r.data?.data || r.data || []))
      .catch(() => {})
  }, [id])

  // Contrairement à Site/Evenement, aucune Reservation n'existe pour un
  // Hotel - un avis n'exige donc pas de preuve de visite, seulement d'être
  // connecté (cf. AvisController::store, décision produit "note chiffrée").
  const submitAvis = async (e) => {
    e.preventDefault()
    if (!avisMessage.trim() || !avisNote) return
    setAvisSubmitting(true)
    try {
      await avisApi.create({ id_hotel: id, message: avisMessage.trim(), note: avisNote })
      toast.success('Merci ! Votre avis sera visible après modération.')
      setAvisJustSubmitted(true)
      setAvisMessage('')
      setAvisNote(0)
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'avis")
    } finally { setAvisSubmitting(false) }
  }

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>
  if (!hotel) return <div className="container page-error"><p>Hôtel introuvable.</p></div>

  const images = hotel.galeries || []
  const chambres = hotel.chambres || []

  return (
    <div className="page-detail">
      <div className="detail-hero">
        {images.length > 0 ? (
          <>
            <img src={images[imgIdx]?.url_fichier || images[imgIdx]?.url} alt={hotel.libelle} className="detail-hero__img" />
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
          <h1>{hotel.libelle}</h1>
          <div className="detail-hero__meta">
            {hotel.adresse && <span><MapPin size={14} /> {hotel.adresse}</span>}
            {hotel.nombre_etoiles && <Stars value={hotel.nombre_etoiles} size={14} />}
            {(hotel.heure_arrivee || hotel.heure_depart) && (
              <span><Clock size={14} /> Arrivée {hotel.heure_arrivee?.slice(0, 5) || '—'} · Départ {hotel.heure_depart?.slice(0, 5) || '—'}</span>
            )}
            {hotel.region && <span>{hotel.region.nom}</span>}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-section">
              <h2>Description</h2>
              <p className="detail-description">{hotel.description || 'Aucune description disponible.'}</p>
            </section>

            <HighlightsSection points={hotel.points_forts} />
            <IncludedSection inclus={hotel.inclus} nonInclus={hotel.non_inclus} />
            <PracticalInfoSection infosPratiques={hotel.infos_pratiques} recommandations={hotel.recommandations} />

            {images.length > 1 && (
              <section className="detail-section">
                <h2>Galerie</h2>
                <div className="detail-gallery">
                  {images.map((img, i) => (
                    <button key={i} className={`detail-gallery__thumb${i === imgIdx ? ' detail-gallery__thumb--active' : ''}`} onClick={() => setImgIdx(i)}>
                      <img src={img.url_fichier || img.url} alt={`${hotel.libelle} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Avis */}
            <section className="detail-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <h2 style={{ marginBottom: 0 }}>Avis des visiteurs</h2>
                <NoteResume moyenne={hotel.note_moyenne} nombre={hotel.nombre_avis} size={15} />
              </div>
              {avisList.length === 0 ? (
                <p className="detail-description" style={{ color: 'var(--gray-500)' }}>Aucun avis pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {avisList.map(a => (
                    <div key={a.id} style={{ borderLeft: '3px solid var(--red)', paddingLeft: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <strong>{a.user?.prenom} {a.user?.nom}</strong>
                        {a.note && <Stars value={a.note} size={12} />}
                      </div>
                      <p style={{ color: 'var(--gray-700)', marginTop: '0.25rem' }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {isAuthenticated && !avisJustSubmitted && (
                <form onSubmit={submitAvis} style={{ marginTop: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gray-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Vous êtes passé par cet hôtel — laissez un avis
                  </label>
                  <StarRatingInput value={avisNote} onChange={setAvisNote} />
                  <textarea
                    required
                    rows={3}
                    value={avisMessage}
                    onChange={e => setAvisMessage(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    style={{ width: '100%', margin: '0.75rem 0' }}
                  />
                  <button type="submit" className="btn btn--primary" disabled={avisSubmitting || !avisNote}>
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
              <h3><BedDouble size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -3 }} />Chambres</h3>
              {chambres.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Aucune chambre renseignée.</p>
              ) : (
                <div className="detail-prix">
                  {chambres.map(c => (
                    <div key={c.id} className="detail-prix__item">
                      <span>
                        {c.type_chambre}
                        {c.capacite && ` · ${c.capacite} pers.`}
                        {!c.disponibilite && ' (indisponible)'}
                      </span>
                      <strong>{Number(c.prix_nuit).toLocaleString('fr-FR')} FCFA / nuit</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FactsCard facts={[
              { icon: Clock, label: "Heure d'arrivée", value: hotel.heure_arrivee?.slice(0, 5) },
              { icon: Clock, label: 'Heure de départ', value: hotel.heure_depart?.slice(0, 5) },
            ]} />

            {hotel.adresse && (
              <div className="detail-card">
                <h3>Infos pratiques</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />{hotel.adresse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
