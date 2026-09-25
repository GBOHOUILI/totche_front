import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Clock, ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react'
import { restaurantsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import { HighlightsSection, IncludedSection, PracticalInfoSection, FactsCard } from '../../components/detail/EnrichedSections'

const GAMME_LABEL = { economique: 'Économique', moyen: 'Moyen', eleve: 'Élevé' }

export default function RestaurantDetail() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    setLoading(true)
    restaurantsApi.get(id)
      .then(r => setRestaurant(r.data?.data || r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>
  if (!restaurant) return <div className="container page-error"><p>Restaurant introuvable.</p></div>

  const images = restaurant.galeries || []
  const plats = restaurant.plats || []

  return (
    <div className="page-detail">
      <div className="detail-hero">
        {images.length > 0 ? (
          <>
            <img src={images[imgIdx]?.url_fichier || images[imgIdx]?.url} alt={restaurant.libelle} className="detail-hero__img" />
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
          <h1>{restaurant.libelle}</h1>
          <div className="detail-hero__meta">
            {restaurant.adresse && <span><MapPin size={14} /> {restaurant.adresse}</span>}
            {restaurant.type_cuisine && <span>{restaurant.type_cuisine}</span>}
            {restaurant.gamme_prix && <span>{GAMME_LABEL[restaurant.gamme_prix] || restaurant.gamme_prix}</span>}
            {restaurant.horaires && <span><Clock size={14} /> {restaurant.horaires}</span>}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-section">
              <h2>Description</h2>
              <p className="detail-description">{restaurant.description || 'Aucune description disponible.'}</p>
            </section>

            <HighlightsSection points={restaurant.points_forts} />
            <IncludedSection inclus={restaurant.inclus} nonInclus={restaurant.non_inclus} />
            <PracticalInfoSection infosPratiques={restaurant.infos_pratiques} recommandations={restaurant.recommandations} />

            {images.length > 1 && (
              <section className="detail-section">
                <h2>Galerie</h2>
                <div className="detail-gallery">
                  {images.map((img, i) => (
                    <button key={i} className={`detail-gallery__thumb${i === imgIdx ? ' detail-gallery__thumb--active' : ''}`} onClick={() => setImgIdx(i)}>
                      <img src={img.url_fichier || img.url} alt={`${restaurant.libelle} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="detail-sidebar">
            <div className="detail-card">
              <h3><UtensilsCrossed size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: -3 }} />Menu</h3>
              {plats.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Aucun plat renseigné.</p>
              ) : (
                <div className="detail-prix">
                  {plats.map(p => (
                    <div key={p.id} className="detail-prix__item">
                      <span>{p.nom}</span>
                      <strong>{Number(p.prix).toLocaleString('fr-FR')} FCFA</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FactsCard facts={[
              { icon: Clock, label: 'Horaires', value: restaurant.horaires },
            ]} />

            {restaurant.adresse && (
              <div className="detail-card">
                <h3>Infos pratiques</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />{restaurant.adresse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
