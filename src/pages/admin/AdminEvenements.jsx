import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, XCircle, X, Image } from 'lucide-react'
import { evenementsApi, categoriesApi, galeriesApi, regionsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  id_cat_evenmt: '', date_debut: '', date_fin: '',
  latitude: '', longitude: '', status: 'en_attente', id_region: ''
}

export default function AdminEvenements() {
  const [events, setEvents] = useState([])
  const [cats, setCats] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [galModal, setGalModal] = useState(null)
  const [galFile, setGalFile] = useState(null)
  const [galLibelle, setGalLibelle] = useState('')

  useEffect(() => {
    load(); categoriesApi.evenements().then(r => setCats(r.data?.data || r.data || []))
    regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = () => {
    setLoading(true)
    evenementsApi.list().then(r => setEvents(r.data?.data || r.data || [])).finally(() => setLoading(false))
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (evt) => {
    setForm({
      libelle: evt.libelle || '', adresse: evt.adresse || '',
      description: evt.description || '', id_cat_evenmt: evt.id_cat_evenmt || '',
      date_debut: evt.date_debut?.split('T')[0] || '',
      date_fin: evt.date_fin?.split('T')[0] || '',
      latitude: evt.latitude || '', longitude: evt.longitude || '',
      status: evt.status || 'en_attente', id_region: evt.id_region || ''
    })
    setModal(evt)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      id_cat_evenmt: form.id_cat_evenmt ? parseInt(form.id_cat_evenmt) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
    }
    try {
      if (modal === 'create') { await evenementsApi.create(payload); toast.success('Événement créé !') }
      else { await evenementsApi.update(modal.id, payload); toast.success('Événement modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleValider = async (id) => {
    try { await evenementsApi.valider(id); toast.success('Validé !'); load() }
    catch { toast.error('Erreur') }
  }

  const handleRejeter = async (id) => {
    try { await evenementsApi.rejeter(id); toast.success('Rejeté'); load() }
    catch { toast.error('Erreur') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return
    try { await evenementsApi.delete(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur') }
  }

  const handleGalerie = async (e) => {
    e.preventDefault()
    if (!galFile) return toast.error('Sélectionnez un fichier')
    const fd = new FormData()
    fd.append('fichier', galFile)
    fd.append('libelle', galLibelle || galFile.name)
    fd.append('type', 'image')
    fd.append('id_evnmt', galModal.id)
    fd.append('status', '1')
    try {
      await galeriesApi.createEvenement(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle(''); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning' })[s] || 'warning'
  const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente' })[s] || s

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Événements</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Date début</th><th>Région</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map(evt => (
              <tr key={evt.id}>
                <td>{evt.libelle}</td>
                <td>{evt.adresse}</td>
                <td>{evt.date_debut ? new Date(evt.date_debut).toLocaleDateString('fr-FR') : '—'}</td>
                <td>{evt.region?.nom || '—'}</td>
                <td><span className={`status-badge status-badge--${statusColor(evt.status)}`}>{statusLabel(evt.status)}</span></td>
                <td>
                  <div className="admin-table__actions">
                    {evt.status !== 'valide' && <button className="admin-icon-btn admin-icon-btn--success" title="Valider" onClick={() => handleValider(evt.id)}><CheckCircle size={15} /></button>}
                    {evt.status !== 'rejete' && <button className="admin-icon-btn admin-icon-btn--danger" title="Rejeter" onClick={() => handleRejeter(evt.id)}><XCircle size={15} /></button>}
                    <button className="admin-icon-btn" title="Galerie" onClick={() => setGalModal(evt)}><Image size={15} /></button>
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(evt)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer" onClick={() => handleDelete(evt.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Créer/Modifier */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{modal === 'create' ? 'Créer un événement' : "Modifier l'événement"}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field"><label>Nom *</label>
                <input value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Adresse *</label>
                <input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} required /></div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Catégorie</label>
                  <select value={form.id_cat_evenmt} onChange={e => setForm(f => ({ ...f, id_cat_evenmt: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                  </select></div>
                <div className="admin-form__field"><label>Région</label>
                  <select value={form.id_region} onChange={e => setForm(f => ({ ...f, id_region: e.target.value }))}>
                    <option value="">Aucune</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                  </select></div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Date début</label>
                  <input type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} /></div>
                <div className="admin-form__field"><label>Date fin</label>
                  <input type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} /></div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} /></div>
                <div className="admin-form__field"><label>Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} /></div>
              </div>
              <div className="admin-form__field"><label>Statut</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="en_attente">En attente</option>
                  <option value="valide">Validé</option>
                  <option value="rejete">Rejeté</option>
                </select></div>
              <div className="admin-form__field"><label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary">{modal === 'create' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Galerie */}
      {galModal && (
        <div className="admin-modal-overlay" onClick={() => setGalModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Galerie — {galModal.libelle}</h2>
              <button onClick={() => setGalModal(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleGalerie} className="admin-form">
                <div className="admin-form__field"><label>Titre</label>
                  <input value={galLibelle} onChange={e => setGalLibelle(e.target.value)} placeholder="Ex: Affiche officielle" /></div>
                <div className="admin-form__field"><label>Fichier image *</label>
                  <input type="file" accept="image/*" onChange={e => setGalFile(e.target.files[0])} required /></div>
                <div className="admin-form__footer">
                  <button type="button" className="btn btn--ghost" onClick={() => setGalModal(null)}>Fermer</button>
                  <button type="submit" className="btn btn--primary">Ajouter</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
