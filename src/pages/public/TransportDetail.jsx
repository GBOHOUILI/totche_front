import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, ChevronLeft, ChevronRight, Route } from 'lucide-react'
import { transportsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'

export default function TransportDetail() {
  const { id } = useParams()
  const [transport, setTransport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    setLoading(true)
    transportsApi.get(id)
      .then(r => setTransport(r.data?.data || r.data))
      .finally(() => setLoading(false))
  }, [id])

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
