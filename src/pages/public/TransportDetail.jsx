import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Clock, ChevronLeft, ChevronRight, Route } from 'lucide-react'
import { transportsApi, avisApi } from '../../api/services'
import { Stars, StarRatingInput, NoteResume, Spinner } from '../../components/ui/index'
import { HighlightsSection, IncludedSection, PracticalInfoSection, FactsCard } from '../../components/detail/EnrichedSections'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function TransportDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [transport, setTransport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  const [avisList, setAvisList] = useState([])
  const [avisMessage, setAvisMessage] = useState('')
  const [avisNote, setAvisNote] = useState(0)
  const [avisSubmitting, setAvisSubmitting] = useState(false)
  const [avisJustSubmitted, setAvisJustSubmitted] = useState(false)

  useEffect(() => {
    setLoading(true)
    transportsApi.get(id)
      .then(r => setTransport(r.data?.data || r.data))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    avisApi.list({ id_transport: id, status: 'approuve' })
      .then(r => setAvisList(r.data?.data || r.data || []))
      .catch(() => {})
  }, [id])

  const submitAvis = async (e) => {
    e.preventDefault()
    if (!avisMessage.trim() || !avisNote) return
    setAvisSubmitting(true)
    try {
      await avisApi.create({ id_transport: id, message: avisMessage.trim(), note: avisNote })
      toast.success('Merci ! Votre avis sera visible après modération.')
      setAvisJustSubmitted(true)
      setAvisMessage('')
      setAvisNote(0)
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'avis")
    } finally { setAvisSubmitting(false) }
  }

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>
  if (!transport) return <div className="container page-error"><p>Service de transport introuvable.</p></div>

  const images = transport.galeries || []
  const trajets = transport.trajets || []

  return (
    <div className="page-detail">
      <div className="detail-hero">
        {images.length > 0 ? (
          <>
            <img src={images[imgIdx]?.url_fichier || images[imgIdx]?.url} alt={transport.libelle} className="detail-hero__img" />
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
          <h1>{transport.libelle}</h1>
          <div className="detail-hero__meta">
            {transport.adresse && <span><MapPin size={14} /> {transport.adresse}</span>}
            {transport.type_transport && <span>{transport.type_transport}</span>}
            {transport.capacite && <span>{transport.capacite} places</span>}
            {transport.duree_trajet_estimee && <span><Clock size={14} /> {transport.duree_trajet_estimee}</span>}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-section">
              <h2>Description</h2>
              <p className="detail-description">{transport.description || 'Aucune description disponible.'}</p>
            </section>

            <HighlightsSection points={transport.points_forts} />
            <IncludedSection inclus={transport.inclus} nonInclus={transport.non_inclus} />
            <PracticalInfoSection infosPratiques={transport.infos_pratiques} recommandations={transport.recommandations} />

            {images.length > 1 && (
              <section className="detail-section">
                <h2>Galerie</h2>
                <div className="detail-gallery">
                  {images.map((img, i) => (
                    <button key={i} className={`detail-gallery__thumb${i === imgIdx ? ' detail-gallery__thumb--active' : ''}`} onClick={() => setImgIdx(i)}>
                      <img src={img.url_fichier || img.url} alt={`${transport.libelle} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Avis */}
            <section className="detail-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <h2 style={{ marginBottom: 0 }}>Avis des visiteurs</h2>
                <NoteResume moyenne={transport.note_moyenne} nombre={transport.nombre_avis} size={15} />
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
                    Vous avez utilisé ce service — laissez un avis
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
              <h3><Route size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -3 }} />Trajets</h3>
              {trajets.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Aucun trajet renseigné.</p>
              ) : (
                <div className="detail-prix">
                  {trajets.map(t => (
                    <div key={t.id} className="detail-prix__item">
                      <span>
                        {t.ville_depart?.nom} → {t.ville_arrivee?.nom}
                        {t.horaire_depart && ` · ${t.horaire_depart.slice(0, 5)}`}
                      </span>
                      <strong>{Number(t.prix).toLocaleString('fr-FR')} FCFA</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FactsCard facts={[
              { icon: Clock, label: 'Durée de trajet estimée', value: transport.duree_trajet_estimee },
            ]} />

            {transport.adresse && (
              <div className="detail-card">
                <h3>Infos pratiques</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />{transport.adresse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
