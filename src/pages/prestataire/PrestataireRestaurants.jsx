import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, UtensilsCrossed } from 'lucide-react'
import { prestatairesApi, regionsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  latitude: '', longitude: '', type_cuisine: '', gamme_prix: '', id_region: '',
}
const emptyPlatForm = { nom: '', prix: '', description: '' }

const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning', suspendu: 'danger' })[s] || 'warning'
const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', suspendu: 'Suspendu' })[s] || s

export default function PrestataireRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [galModal, setGalModal] = useState(null)
  const [galFile, setGalFile] = useState(null)
  const [galLibelle, setGalLibelle] = useState('')
  const [platModal, setPlatModal] = useState(null)
  const [platForm, setPlatForm] = useState(emptyPlatForm)

  useEffect(() => {
    load(); regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await prestatairesApi.mesRestaurants()
      const data = r.data?.data || r.data || []
      setRestaurants(data)
      return data
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (restaurant) => {
    setForm({
      libelle: restaurant.libelle || '', adresse: restaurant.adresse || '',
      description: restaurant.description || '', latitude: restaurant.latitude || '',
      longitude: restaurant.longitude || '', type_cuisine: restaurant.type_cuisine || '',
      gamme_prix: restaurant.gamme_prix || '', id_region: restaurant.id_region || '',
    })
    setModal(restaurant)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
    }
    try {
      if (modal === 'create') { await prestatairesApi.createRestaurant(payload); toast.success('Restaurant créé — en attente de validation') }
      else { await prestatairesApi.updateRestaurant(modal.id, payload); toast.success('Restaurant modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce restaurant ?')) return
    try { await prestatairesApi.deleteRestaurant(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  const handleGalerie = async (e) => {
    e.preventDefault()
    if (!galFile) return toast.error('Sélectionnez un fichier')
    const fd = new FormData()
    fd.append('fichier', galFile)
    fd.append('libelle', galLibelle || galFile.name)
    fd.append('type', 'image')
    fd.append('id_restaurant', galModal.id)
    try {
      await prestatairesApi.createGalerieRestaurant(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const handlePlat = async (e) => {
    e.preventDefault()
    try {
      await prestatairesApi.createPlat({
        id_restaurant: platModal.id,
        nom: platForm.nom,
        prix: parseFloat(platForm.prix),
        description: platForm.description || undefined,
      })
      toast.success('Plat ajouté !')
      setPlatForm(emptyPlatForm)
      const fresh = await load()
      setPlatModal(r => fresh.find(x => x.id === r.id) || r)
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const deletePlat = async (id) => {
    try {
      await prestatairesApi.deletePlat(id)
      toast.success('Plat supprimé')
      const fresh = await load()
      setPlatModal(r => fresh.find(x => x.id === r.id) || r)
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Mes Restaurants</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : restaurants.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Aucun restaurant pour l'instant — cliquez sur "Ajouter" pour créer votre première fiche.
        </p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Cuisine</th><th>Région</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {restaurants.map(restaurant => (
              <tr key={restaurant.id}>
                <td>{restaurant.libelle}</td>
                <td>{restaurant.adresse}</td>
                <td>{restaurant.type_cuisine || '—'}</td>
                <td>{restaurant.region?.nom || '—'}</td>
                <td><span className={`status-badge status-badge--${statusColor(restaurant.status)}`}>{statusLabel(restaurant.status)}</span></td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Plats" onClick={() => setPlatModal(restaurant)}><UtensilsCrossed size={15} /></button>
                    <button className="admin-icon-btn" title="Galerie" onClick={() => setGalModal(restaurant)}><Image size={15} /></button>
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(restaurant)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer" onClick={() => handleDelete(restaurant.id)}><Trash2 size={15} /></button>
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
              <h2>{modal === 'create' ? 'Créer un restaurant' : 'Modifier le restaurant'}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field"><label>Nom *</label>
                <input value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Adresse *</label>
                <input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} required /></div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Type de cuisine</label>
                  <input value={form.type_cuisine} onChange={e => setForm(f => ({ ...f, type_cuisine: e.target.value }))} placeholder="Ex: Locale" /></div>
                <div className="admin-form__field"><label>Gamme de prix</label>
                  <select value={form.gamme_prix} onChange={e => setForm(f => ({ ...f, gamme_prix: e.target.value }))}>
                    <option value="">—</option>
                    <option value="economique">Économique</option>
                    <option value="moyen">Moyen</option>
                    <option value="eleve">Élevé</option>
                  </select></div>
              </div>
              <div className="admin-form__field"><label>Région</label>
                <select value={form.id_region} onChange={e => setForm(f => ({ ...f, id_region: e.target.value }))}>
                  <option value="">Sélectionner...</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                </select></div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Latitude *</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required /></div>
                <div className="admin-form__field"><label>Longitude *</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required /></div>
              </div>
              <div className="admin-form__field"><label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                {modal === 'create'
                  ? "Ce restaurant sera créé en attente — il deviendra visible publiquement une fois validé."
                  : "Le statut de validation n'est pas modifiable ici."}
              </p>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary">{modal === 'create' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Plats */}
      {platModal && (
        <div className="admin-modal-overlay" onClick={() => setPlatModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Plats — {platModal.libelle}</h2>
              <button onClick={() => setPlatModal(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              {platModal.plats?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {platModal.plats.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--gray-100)' }}>
                      <span>{p.nom} — <strong>{Number(p.prix).toLocaleString('fr-FR')} FCFA</strong></span>
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deletePlat(p.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handlePlat} className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field"><label>Nom *</label>
                    <input value={platForm.nom} onChange={e => setPlatForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Poulet braisé" required /></div>
                  <div className="admin-form__field"><label>Prix (FCFA) *</label>
                    <input type="number" min="0" value={platForm.prix} onChange={e => setPlatForm(f => ({ ...f, prix: e.target.value }))} required /></div>
                </div>
                <div className="admin-form__footer">
                  <button type="button" className="btn btn--ghost" onClick={() => setPlatModal(null)}>Fermer</button>
                  <button type="submit" className="btn btn--primary">Ajouter le plat</button>
                </div>
              </form>
            </div>
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
              {galModal.galeries?.length > 0 && (
                <div className="detail-gallery" style={{ marginBottom: '1.5rem' }}>
                  {galModal.galeries.map(g => (
                    <div key={g.id} style={{ position: 'relative' }}>
                      <img src={g.url_fichier || g.url} alt={g.libelle} style={{ borderRadius: 8, width: '100%', height: 80, objectFit: 'cover' }} />
                      <button
                        style={{ position: 'absolute', top: 4, right: 4, background: 'var(--red)', color: 'var(--white)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 11 }}
                        onClick={async () => { await prestatairesApi.deleteGalerieRestaurant(g.id); load(); setGalModal(r => ({ ...r, galeries: r.galeries.filter(x => x.id !== g.id) })) }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleGalerie} className="admin-form">
                <div className="admin-form__field"><label>Titre de l'image</label>
                  <input value={galLibelle} onChange={e => setGalLibelle(e.target.value)} placeholder="Ex: Salle" /></div>
                <div className="admin-form__field"><label>Fichier image *</label>
                  <input type="file" accept="image/*" onChange={e => setGalFile(e.target.files[0])} required /></div>
                <div className="admin-form__footer">
                  <button type="button" className="btn btn--ghost" onClick={() => setGalModal(null)}>Fermer</button>
                  <button type="submit" className="btn btn--primary">Ajouter l'image</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
