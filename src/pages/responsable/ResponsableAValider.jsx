import { useState, useEffect } from 'react'
import { MapPin, Calendar, Hotel, UtensilsCrossed, Bus, CheckCircle, XCircle, MessageCircleQuestion } from 'lucide-react'
import { responsablesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const SECTIONS = [
  { key: 'sites', label: 'Sites', icon: MapPin, color: 'var(--success)', valider: 'validerSite', rejeter: 'rejeterSite', precisions: 'demanderPrecisionsSite' },
  { key: 'evenements', label: 'Événements', icon: Calendar, color: 'var(--red)', valider: 'validerEvenement', rejeter: 'rejeterEvenement', precisions: 'demanderPrecisionsEvenement' },
  { key: 'hotels', label: 'Hôtels', icon: Hotel, color: 'var(--success)', valider: 'validerHotel', rejeter: 'rejeterHotel', precisions: 'demanderPrecisionsHotel' },
  { key: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, color: 'var(--red)', valider: 'validerRestaurant', rejeter: 'rejeterRestaurant', precisions: 'demanderPrecisionsRestaurant' },
  { key: 'transports', label: 'Transports', icon: Bus, color: 'var(--success)', valider: 'validerTransport', rejeter: 'rejeterTransport', precisions: 'demanderPrecisionsTransport' },
]

export default function ResponsableAValider() {
  const { user } = useAuth()
  const [data, setData] = useState({ sites: [], evenements: [], hotels: [], restaurants: [], transports: [] })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { section, item } | null
  const [commentaire, setCommentaire] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

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

  const ouvrirModalPrecisions = (section, item) => {
    setModal({ section, item })
    setCommentaire('')
  }

  const envoyerPrecisions = async (e) => {
    e.preventDefault()
    if (! commentaire.trim() || ! modal) return
    setEnvoiEnCours(true)
    try {
      await responsablesApi[modal.section.precisions](modal.item.id, commentaire.trim())
      toast.success('Demande de précisions envoyée au prestataire')
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setEnvoiEnCours(false)
    }
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
                          <button className="admin-icon-btn" title="Demander des précisions" onClick={() => ouvrirModalPrecisions(section, item)}><MessageCircleQuestion size={15} /></button>
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

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Demander des précisions</h2>
              <button onClick={() => setModal(null)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={envoyerPrecisions} className="admin-form">
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                {modal.item.libelle} — le prestataire verra ce message et pourra corriger sa fiche, qui reviendra automatiquement dans votre file une fois modifiée.
              </p>
              <div className="admin-form__field">
                <label>Message au prestataire *</label>
                <textarea
                  rows={4}
                  placeholder="Ex. Merci d'ajouter au moins une photo et de préciser les horaires d'ouverture."
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  autoFocus
                  required
                  minLength={5}
                />
              </div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={envoiEnCours || commentaire.trim().length < 5}>
                  {envoiEnCours ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
