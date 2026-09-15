import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { categoriesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [siteCats, setSiteCats] = useState([])
  const [eventCats, setEventCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { type: 'site'|'event', mode: 'create'|obj }
  const [libelle, setLibelle] = useState('')

  useEffect(() => { load() }, [])

  const load = () => {
    setLoading(true)
    Promise.all([categoriesApi.sites(), categoriesApi.evenements()])
      .then(([s, e]) => {
        setSiteCats(s.data?.data || s.data || [])
        setEventCats(e.data?.data || e.data || [])
      })
      .finally(() => setLoading(false))
  }

  const openCreate = (type) => { setModal({ type, mode: 'create' }); setLibelle('') }
  const openEdit = (type, cat) => { setModal({ type, mode: cat }); setLibelle(cat.libelle) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { type, mode } = modal
    try {
      if (mode === 'create') {
        if (type === 'site') await categoriesApi.createSite({ libelle })
        else await categoriesApi.createEvenement({ libelle })
        toast.success('Catégorie créée !')
      } else {
        if (type === 'site') await categoriesApi.updateSite(mode.id, { libelle })
        else await categoriesApi.updateEvenement(mode.id, { libelle })
        toast.success('Catégorie modifiée !')
      }
      setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const handleDelete = async (type, id) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    try {
      if (type === 'site') await categoriesApi.deleteSite(id)
      else await categoriesApi.deleteEvenement(id)
      toast.success('Supprimée'); load()
    } catch { toast.error('Erreur lors de la suppression') }
  }

  const CatTable = ({ type, cats }) => (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Catégories {type === 'site' ? 'Sites' : 'Événements'}</h2>
        <button className="btn btn--primary btn--sm" onClick={() => openCreate(type)}><Plus size={14} /> Ajouter</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>#</th><th>Libellé</th><th>Actions</th></tr></thead>
        <tbody>
          {cats.length === 0 ? (
            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-500)' }}>Aucune catégorie</td></tr>
          ) : cats.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.libelle}</td>
              <td>
                <div className="admin-table__actions">
                  <button className="admin-icon-btn" onClick={() => openEdit(type, cat)}><Pencil size={15} /></button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDelete(type, cat.id)}><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="admin-page__header"><h1>Catégories</h1></div>
      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CatTable type="site" cats={siteCats} />
          <CatTable type="event" cats={eventCats} />
        </div>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{modal.mode === 'create' ? 'Nouvelle catégorie' : 'Modifier'}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field">
                <label>Libellé *</label>
                <input value={libelle} onChange={e => setLibelle(e.target.value)} placeholder="Ex: Patrimoine Historique" required />
              </div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary">{modal.mode === 'create' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
