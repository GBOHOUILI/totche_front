import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { prixApi, sitesApi, evenementsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const emptyForm = { libelle: '', montant: '', id_site: '', id_evnmt: '' }

export default function AdminPrix() {
  const [prix, setPrix] = useState([])
  const [sites, setSites] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    load()
    sitesApi.list().then(r => setSites(r.data?.data || r.data || []))
    evenementsApi.list().then(r => setEvents(r.data?.data || r.data || []))
  }, [])

  const load = () => {
    setLoading(true)
    prixApi.list().then(r => setPrix(r.data?.data || r.data || [])).finally(() => setLoading(false))
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (p) => {
    setForm({ libelle: p.libelle || '', montant: p.montant || '', id_site: p.id_site || '', id_evnmt: p.id_evnmt || '' })
    setModal(p)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      libelle: form.libelle,
      montant: parseFloat(form.montant),
      id_site: form.id_site ? parseInt(form.id_site) : null,
      id_evnmt: form.id_evnmt ? parseInt(form.id_evnmt) : null,
    }
    try {
      if (modal === 'create') { await prixApi.create(payload); toast.success('Tarif créé !') }
      else { await prixApi.update(modal.id, payload); toast.success('Tarif modifié !') }
      setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce tarif ?')) return
    try { await prixApi.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Tarifs</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter un tarif</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <table className="admin-table">
          <thead><tr><th>Libellé</th><th>Montant</th><th>Site</th><th>Événement</th><th>Actions</th></tr></thead>
          <tbody>
            {prix.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun tarif</td></tr>
            ) : prix.map(p => (
              <tr key={p.id}>
                <td>{p.libelle}</td>
                <td><strong>{Number(p.montant).toLocaleString('fr-FR')} FCFA</strong></td>
                <td>{p.site?.libelle || '-'}</td>
                <td>{p.evenement?.libelle || '-'}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" onClick={() => openEdit(p)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDelete(p.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{modal === 'create' ? 'Créer un tarif' : 'Modifier le tarif'}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field"><label>Libellé *</label>
                <input value={form.libelle} placeholder="Ex: Adulte, Enfant, Étudiant"
                  onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Montant (FCFA) *</label>
                <input type="number" min={0} value={form.montant} placeholder="Ex: 2000"
                  onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Site touristique</label>
                <select value={form.id_site} onChange={e => setForm(f => ({ ...f, id_site: e.target.value, id_evnmt: '' }))}>
                  <option value="">Aucun</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                </select></div>
              <div className="admin-form__field"><label>Événement</label>
                <select value={form.id_evnmt} onChange={e => setForm(f => ({ ...f, id_evnmt: e.target.value, id_site: '' }))}>
                  <option value="">Aucun</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.libelle}</option>)}
                </select></div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary">{modal === 'create' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
