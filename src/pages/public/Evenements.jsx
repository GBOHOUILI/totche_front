import { useState, useEffect } from 'react'
import { Search, X, Calendar } from 'lucide-react'
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

  useEffect(() => {
    categoriesApi.evenements().then(r => setCategories(r.data?.data || r.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    evenementsApi.list({
      page,
      libelle: search || undefined,
      id_cat_evenmt: selectedCat || undefined,
    })
      .then(r => {
        setEvents(r.data?.data || r.data || [])
        setMeta(r.data?.meta || null)
      })
      .finally(() => setLoading(false))
  }, [page, search, selectedCat])

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
