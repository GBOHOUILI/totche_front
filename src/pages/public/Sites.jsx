import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, MapPin, Landmark, Trees, Building2, Milestone, Waves, Tag } from 'lucide-react'
import { sitesApi, categoriesApi, regionsApi } from '../../api/services'
import { SiteCard, Spinner, EmptyState } from '../../components/ui/index'

// Icône par catégorie pour les filtres pilules - purement présentationnel,
// catégorie non mappée -> icône générique (Tag), jamais d'erreur.
const CAT_ICON = {
  'Patrimoine historique': Landmark,
  'Site naturel': Trees,
  'Musée': Building2,
  'Monument': Milestone,
  'Plage': Waves,
}

export default function Sites() {
  const [sites, setSites] = useState([])
  const [categories, setCategories] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [searchParams] = useSearchParams()
  const [geo, setGeo] = useState(null) // { lat, lng } | null
  const [radius, setRadius] = useState(25)
  const [geoError, setGeoError] = useState('')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')

  useEffect(() => {
    categoriesApi.sites().then(r => setCategories(r.data?.data || r.data || []))
    regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  // Resynchronise avec l'URL à chaque navigation (ex: lien du mega-menu vers
  // /sites?categorie=X depuis une page /sites déjà montée - pas de remount React Router).
  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setSelectedCat(searchParams.get('categorie') || '')
    setPage(1)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    sitesApi.list({
      page,
      libelle: search || undefined,
      id_cat_site: selectedCat || undefined,
      id_region: selectedRegion || undefined,
      lat: geo?.lat,
      lng: geo?.lng,
      radius: geo ? radius : undefined,
      prix_min: prixMin || undefined,
      prix_max: prixMax || undefined,
    })
      .then(r => {
        setSites(r.data?.data || r.data || [])
        setMeta(r.data?.meta || null)
      })
      .finally(() => setLoading(false))
  }, [page, search, selectedCat, selectedRegion, geo, radius, prixMin, prixMax])

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
        <h1>Sites Touristiques</h1>
        <p>Découvrez les merveilles historiques, culturelles et naturelles du Bénin</p>
      </div>

      <div className="container">
        <div className="filters">
          <div className="filters__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher un site..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {search && <button onClick={() => { setSearch(''); setPage(1) }}><X size={14} /></button>}
          </div>

          <div className="filters__cats">
            <button className={`filters__cat${!selectedCat ? ' filters__cat--active' : ''}`}
              onClick={() => { setSelectedCat(''); setPage(1) }}>Tous</button>
            {categories.map(cat => {
              const Icon = CAT_ICON[cat.libelle] || Tag
              return (
                <button key={cat.id}
                  className={`filters__cat${selectedCat == cat.id ? ' filters__cat--active' : ''}`}
                  onClick={() => { setSelectedCat(cat.id); setPage(1) }}>
                  <Icon size={14} /> {cat.libelle}
                </button>
              )
            })}
          </div>

          <div className="filters__extra">
            <select
              className="filters__select"
              value={selectedRegion}
              onChange={e => { setSelectedRegion(e.target.value); setPage(1) }}
            >
              <option value="">Toutes les régions</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
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
                className="filters__select"
                value={radius}
                onChange={e => { setRadius(Number(e.target.value)); setPage(1) }}
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
              className="filters__input-sm"
            />
            <input
              type="number"
              min="0"
              placeholder="Prix max"
              value={prixMax}
              onChange={e => { setPrixMax(e.target.value); setPage(1) }}
              className="filters__input-sm"
            />
            {geoError && <span className="filters__error">{geoError}</span>}
          </div>
        </div>

        {loading ? (
          <div className="center-spinner"><Spinner size="lg" /></div>
        ) : sites.length === 0 ? (
          <EmptyState message="Aucun site touristique trouvé" icon={MapPin} />
        ) : (
          <>
            <div className="cards-grid cards-grid--4">
              {sites.map((site, i) => <SiteCard key={site.id} site={site} index={i} />)}
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
