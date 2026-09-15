import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, MapPin } from 'lucide-react'
import { sitesApi, categoriesApi } from '../../api/services'
import { SiteCard, Spinner, EmptyState } from '../../components/ui/index'

export default function Sites() {
  const [sites, setSites] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    categoriesApi.sites().then(r => setCategories(r.data?.data || r.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    sitesApi.list({
      page,
      libelle: search || undefined,
      id_cat_site: selectedCat || undefined,
    })
      .then(r => {
        setSites(r.data?.data || r.data || [])
        setMeta(r.data?.meta || null)
      })
      .finally(() => setLoading(false))
  }, [page, search, selectedCat])

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
            {categories.map(cat => (
              <button key={cat.id}
                className={`filters__cat${selectedCat == cat.id ? ' filters__cat--active' : ''}`}
                onClick={() => { setSelectedCat(cat.id); setPage(1) }}>
                {cat.libelle}
              </button>
            ))}
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
