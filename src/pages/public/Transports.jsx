import { useState, useEffect } from 'react'
import { Search, X, MapPin, Bus } from 'lucide-react'
import { transportsApi } from '../../api/services'
import { TransportCard, Spinner, EmptyState } from '../../components/ui/index'

export default function Transports() {
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [geo, setGeo] = useState(null)
  const [radius, setRadius] = useState(25)
  const [geoError, setGeoError] = useState('')

  useEffect(() => {
    setLoading(true)
    transportsApi.list({
      page,
      libelle: search || undefined,
      lat: geo?.lat,
      lng: geo?.lng,
      radius: geo ? radius : undefined,
    })
      .then(r => { setTransports(r.data?.data || r.data || []); setMeta(r.data?.meta || null) })
      .finally(() => setLoading(false))
  }, [page, search, geo, radius])

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
    <div className="page-sites">
      <div className="page-hero page-hero--sm">
        <h1>Transports</h1>
        <p>Déplacez-vous facilement à travers le Bénin</p>
      </div>

      <div className="container">
        <div className="filters">
          <div className="filters__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher un service de transport..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {search && <button onClick={() => { setSearch(''); setPage(1) }}><X size={14} /></button>}
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
            {geoError && <span style={{ color: 'var(--red-dark)', fontSize: '0.8rem' }}>{geoError}</span>}
          </div>
        </div>

        {loading ? (
          <div className="center-spinner"><Spinner size="lg" /></div>
        ) : transports.length === 0 ? (
          <EmptyState message="Aucun service de transport trouvé" icon={Bus} />
        ) : (
          <>
            <div className="cards-grid cards-grid--4">
              {transports.map((transport, i) => <TransportCard key={transport.id} transport={transport} index={i} />)}
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
