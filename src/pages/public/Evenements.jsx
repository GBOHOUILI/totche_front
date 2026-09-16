import { useState, useEffect } from 'react'
import { Search, X, Calendar, MapPin } from 'lucide-react'
import { evenementsApi, categoriesApi } from '../../api/services'
import { EventCard, Spinner, EmptyState } from '../../components/ui/index'

export default function Evenements() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [geo, setGeo] = useState(null) // { lat, lng } | null
  const [radius, setRadius] = useState(25)
  const [geoError, setGeoError] = useState('')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')

  useEffect(() => {
    categoriesApi.evenements().then(r => setCategories(r.data?.data || r.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    evenementsApi.list({
      page,
      libelle: search || undefined,
      id_cat_evenmt: selectedCat || undefined,
      lat: geo?.lat,
      lng: geo?.lng,
      radius: geo ? radius : undefined,
      prix_min: prixMin || undefined,
      prix_max: prixMax || undefined,
    })
      .then(r => {
        setEvents(r.data?.data || r.data || [])
        setMeta(r.data?.meta || null)
      })
      .finally(() => setLoading(false))
  }, [page, search, selectedCat, geo, radius, prixMin, prixMax])

  const toggleGeo = () => {
    if (geo) { setGeo(null); setGeoError(''); return }
    if (!navigator.geolocation) { setGeoError('Géolocalisation non disponible sur cet appareil'); return }
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setPage(1) },
      () => setGeoError("Impossible d'accéder à votre position"),
    )
  }

  return (
    <div className="page-evenements">
      <div className="page-hero page-hero--sm page-hero--events">
        <h1>Évènements Culturels</h1>
        <p>Festivals, expositions, concerts et bien plus au cœur du Bénin</p>
      </div>

      <div className="container">
        <div className="filters">
          <div className="filters__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {search && <button onClick={() => { setSearch(''); setPage(1) }}><X size={14} /></button>}
          </div>

          <div className="filters__cats">
            <button className={`filters__cat${!selectedCat ? ' filters__cat--active' : ''}`}
              onClick={() => { setSelectedCat(''); setPage(1) }}>Tous</button>
            {categories.map(cat => (
              <button key={cat.id}
                className={`filters__cat${selectedCat == cat.id ? ' filters__cat--active' : ''}`}
                onClick={() => { setSelectedCat(cat.id); setPage(1) }}>
                {cat.libelle}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', margin: '0.75rem 0 0' }}>
            <button
              type="button"
              className={`filters__cat${geo ? ' filters__cat--active' : ''}`}
              onClick={toggleGeo}
            >
              <MapPin size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
              {geo ? 'Près de moi (actif)' : 'Près de moi'}
            </button>
            {geo && (
              <select
                value={radius}
                onChange={e => { setRadius(Number(e.target.value)); setPage(1) }}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', background: 'var(--white)', color: 'var(--black)', fontSize: '0.85rem' }}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            )}
            <input
              type="number"
              min="0"
              placeholder="Prix min"
              value={prixMin}
              onChange={e => { setPrixMin(e.target.value); setPage(1) }}
              style={{ width: 100, padding: '0.4rem 0.6rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)' }}
            />
            <input
              type="number"
              min="0"
              placeholder="Prix max"
              value={prixMax}
              onChange={e => { setPrixMax(e.target.value); setPage(1) }}
              style={{ width: 100, padding: '0.4rem 0.6rem', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)' }}
            />
            {geoError && <span style={{ color: 'var(--red-dark)', fontSize: '0.8rem' }}>{geoError}</span>}
          </div>
        </div>

        {loading ? (
          <div className="center-spinner"><Spinner size="lg" /></div>
        ) : events.length === 0 ? (
          <EmptyState message="Aucun événement programmé pour l'instant" icon={Calendar} />
        ) : (
          <>
            <div className="cards-grid cards-grid--4">
              {events.map((evt, i) => <EventCard key={evt.id} event={evt} index={i} />)}
            </div>
            {meta && meta.last_page > 1 && (
              <div className="pagination">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
                    onClick={() => setPage(p)}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
