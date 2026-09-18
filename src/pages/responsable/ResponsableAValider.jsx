import { useState, useEffect } from 'react'
import { MapPin, Calendar, Hotel, UtensilsCrossed, Bus, CheckCircle, XCircle } from 'lucide-react'
import { responsablesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const SECTIONS = [
  { key: 'sites', label: 'Sites', icon: MapPin, color: 'var(--success)', valider: 'validerSite', rejeter: 'rejeterSite' },
  { key: 'evenements', label: 'Événements', icon: Calendar, color: 'var(--red)', valider: 'validerEvenement', rejeter: 'rejeterEvenement' },
  { key: 'hotels', label: 'Hôtels', icon: Hotel, color: 'var(--success)', valider: 'validerHotel', rejeter: 'rejeterHotel' },
  { key: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, color: 'var(--red)', valider: 'validerRestaurant', rejeter: 'rejeterRestaurant' },
  { key: 'transports', label: 'Transports', icon: Bus, color: 'var(--success)', valider: 'validerTransport', rejeter: 'rejeterTransport' },
]

export default function ResponsableAValider() {
  const { user } = useAuth()
  const [data, setData] = useState({ sites: [], evenements: [], hotels: [], restaurants: [], transports: [] })
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    responsablesApi.aValider()
      .then(r => setData({
        sites: r.data?.sites || [],
        evenements: r.data?.evenements || [],
        hotels: r.data?.hotels || [],
        restaurants: r.data?.restaurants || [],
        transports: r.data?.transports || [],
      }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const valider = async (section, id) => {
    try { await responsablesApi[section.valider](id); toast.success(`${section.label.slice(0, -1)} validé(e)`); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }
  const rejeter = async (section, id) => {
    try { await responsablesApi[section.rejeter](id); toast.success(`${section.label.slice(0, -1)} rejeté(e)`); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  if (loading) return <div className="center-spinner"><Spinner /></div>

  const total = SECTIONS.reduce((sum, s) => sum + data[s.key].length, 0)

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>À valider</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {user?.region?.nom
              ? `Fiches en attente dans la région ${user.region.nom}`
              : 'Responsable global - fiches en attente dans toutes les régions'}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Rien à valider pour l'instant.
        </p>
      ) : (
        SECTIONS.map(section => {
          const items = data[section.key]
          if (items.length === 0) return null
          const Icon = section.icon
          return (
            <div key={section.key} className="admin-section" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={16} color={section.color} /> {section.label} ({items.length})
              </h2>
              <table className="admin-table">
                <thead><tr><th>Nom</th><th>Région</th><th>Prestataire</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.libelle}</td>
                      <td>{item.region?.nom || '-'}</td>
                      <td>{item.prestataire?.nom_entreprise || item.admin?.nom || '-'}</td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-icon-btn admin-icon-btn--success" title="Valider" onClick={() => valider(section, item.id)}><CheckCircle size={15} /></button>
                          <button className="admin-icon-btn admin-icon-btn--danger" title="Rejeter" onClick={() => rejeter(section, item.id)}><XCircle size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
    </div>
  )
}
