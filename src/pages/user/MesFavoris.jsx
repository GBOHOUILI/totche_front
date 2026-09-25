import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { favorisApi } from '../../api/services'
import { SiteCard, EventCard, HotelCard, RestaurantCard, TransportCard, Spinner, EmptyState } from '../../components/ui/index'
import { useFavoris } from '../../context/FavorisContext'

const CARD_BY_TYPE = {
  site: SiteCard,
  evenement: EventCard,
  hotel: HotelCard,
  restaurant: RestaurantCard,
  transport: TransportCard,
}
const PROP_NAME_BY_TYPE = {
  site: 'site',
  evenement: 'event',
  hotel: 'hotel',
  restaurant: 'restaurant',
  transport: 'transport',
}

export default function MesFavoris() {
  const [favoris, setFavoris] = useState([])
  const [loading, setLoading] = useState(true)
  // isFavori vient du contexte partagé (mis à jour par le cœur cliqué depuis
  // n'importe quelle carte, y compris celles rendues ici) - filtrer dessus
  // à chaque rendu fait disparaître un favori retiré sans recharger la liste.
  const { isFavori } = useFavoris()

  const load = useCallback(() => {
    favorisApi.list()
      .then(r => setFavoris((r.data || []).filter(f => f.item)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const visibles = favoris.filter(f => isFavori(f.type, f.item.id))

  return (
    <div className="page-reservations">
      <div className="page-hero page-hero--sm">
        <h1>Mes Favoris</h1>
        <p>Retrouvez les sites, événements et services que vous avez mis de côté</p>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        {loading ? (
          <div className="center-spinner"><Spinner size="lg" /></div>
        ) : visibles.length === 0 ? (
          <EmptyState message="Vous n'avez pas encore de favori - cliquez sur le cœur d'une fiche pour la retrouver ici" icon={Heart} />
        ) : (
          <div className="cards-grid cards-grid--5">
            {visibles.map((f, i) => {
              const Card = CARD_BY_TYPE[f.type]
              if (!Card) return null
              const props = { [PROP_NAME_BY_TYPE[f.type]]: f.item, index: i }
              return <Card key={`${f.type}-${f.item.id}`} {...props} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
