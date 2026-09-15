const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

/**
 * Construit l'URL complète d'une image depuis le champ url_fichier du backend
 * Ex: "galeries/sites/abc.jpg" → "http://localhost:8000/storage/galeries/sites/abc.jpg"
 */
export const getImageUrl = (url_fichier) => {
  if (!url_fichier) return null
  if (url_fichier.startsWith('http')) return url_fichier
  return `${BASE_URL}/storage/${url_fichier}`
}