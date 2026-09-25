import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { favorisApi } from '../api/services'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const FavorisContext = createContext(null)

// Map "type:id" -> id du favori (nécessaire pour DELETE /favoris/{id}).
// Chargée une seule fois à la connexion, mise à jour de façon optimiste au
// clic - les cartes (SiteCard, EventCard...) n'ont donc jamais à interroger
// l'API individuellement pour savoir si elles sont favorites.
export function FavorisProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  // GET /favoris n'existe que sur le guard sanctum (touriste) - pour un
  // admin/prestataire/responsable authentifié, cet appel renvoie 401 et
  // déclenche l'intercepteur global (client.js), qui déconnecte et redirige
  // vers /connexion en pleine session admin/prestataire/responsable.
  const estTouriste = isAuthenticated && user?.role === 'user'
  const [favoris, setFavoris] = useState(new Map())

  const load = useCallback(() => {
    if (!estTouriste) { setFavoris(new Map()); return }
    favorisApi.list().then(r => {
      const map = new Map()
      ;(r.data || []).forEach(f => { if (f.item) map.set(`${f.type}:${f.item.id}`, f.id) })
      setFavoris(map)
    }).catch(() => {})
  }, [estTouriste])

  useEffect(() => { load() }, [load])

  const isFavori = (type, id) => favoris.has(`${type}:${id}`)

  const toggle = async (type, id) => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter un favori')
      return
    }
    const key = `${type}:${id}`
    const existingId = favoris.get(key)

    if (existingId) {
      setFavoris(prev => { const next = new Map(prev); next.delete(key); return next })
      try {
        await favorisApi.remove(existingId)
        toast.success('Retiré des favoris')
      } catch {
        toast.error("Erreur - favori non retiré")
        setFavoris(prev => new Map(prev).set(key, existingId))
      }
    } else {
      try {
        const res = await favorisApi.add(type, id)
        setFavoris(prev => new Map(prev).set(key, res.data.id))
        toast.success('Ajouté aux favoris')
      } catch {
        toast.error("Erreur - favori non ajouté")
      }
    }
  }

  return (
    <FavorisContext.Provider value={{ isFavori, toggle, reload: load }}>
      {children}
    </FavorisContext.Provider>
  )
}

export const useFavoris = () => {
  const ctx = useContext(FavorisContext)
  if (!ctx) throw new Error('useFavoris must be used within FavorisProvider')
  return ctx
}
