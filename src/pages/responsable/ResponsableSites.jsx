import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, Tag } from 'lucide-react'
import { responsablesApi, categoriesApi, regionsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  id_cat_site: '', latitude: '', longitude: '',
  ouverture: '', fermeture: '', id_region: '',
}
const emptyPrixForm = { libelle: '', montant: '' }

const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning', suspendu: 'danger' })[s] || 'warning'
const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', suspendu: 'Suspendu' })[s] || s

// Un responsable scopé crée toujours dans sa propre région (forcé côté
// serveur de toute façon) - pas de select, juste un rappel. Un responsable
// global n'en a pas : il doit en choisir une.
export default function ResponsableSites() {
  const { user } = useAuth()
  const estGlobal = !user?.region
  const [sites, setSites] = useState([])
  const [cats, setCats] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [galModal, setGalModal] = useState(null)
  const [galFile, setGalFile] = useState(null)
  const [galLibelle, setGalLibelle] = useState('')
  const [prixModal, setPrixModal] = useState(null)
  const [prixForm, setPrixForm] = useState(emptyPrixForm)

  useEffect(() => {
    load(); categoriesApi.sites().then(r => setCats(r.data?.data || r.data || []))
    if (estGlobal) regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await responsablesApi.mesSites()
      const data = r.data?.data || r.data || []
      setSites(data)
      return data
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (site) => {
    setForm({
      libelle: site.libelle || '', adresse: site.adresse || '',
      description: site.description || '', id_cat_site: site.id_cat_site || '',
      latitude: site.latitude || '', longitude: site.longitude || '',
      ouverture: site.ouverture || '', fermeture: site.fermeture || '',
      id_region: site.id_region || '',
    })
    setModal(site)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      id_cat_site: form.id_cat_site ? parseInt(form.id_cat_site) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
    }
    try {
      if (modal === 'create') { await responsablesApi.createSite(payload); toast.success('Site créé - seul un admin peut le valider') }
      else { await responsablesApi.updateSite(modal.id, payload); toast.success('Site modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce site ?')) return
    try { await responsablesApi.deleteSite(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  const handleGalerie = async (e) => {
    e.preventDefault()
    if (!galFile) return toast.error('Sélectionnez un fichier')
    const fd = new FormData()
    fd.append('fichier', galFile)
    fd.append('libelle', galLibelle || galFile.name)
    fd.append('type', 'image')
    fd.append('id_site', galModal.id)
    try {
      await responsablesApi.createGalerieSite(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const handlePrix = async (e) => {
    e.preventDefault()
    try {
      await responsablesApi.createPrix({ libelle: prixForm.libelle, montant: parseFloat(prixForm.montant), id_site: prixModal.id })
      toast.success('Tarif ajouté !')
      setPrixForm(emptyPrixForm)
      const fresh = await load()
      setPrixModal(s => fresh.find(x => x.id === s.id) || s)
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const deletePrix = async (id) => {
    try {
      await responsablesApi.deletePrix(id)
      toast.success('Tarif supprimé')
      const fresh = await load()
      setPrixModal(s => fresh.find(x => x.id === s.id) || s)
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Mes Sites</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : sites.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Aucun site pour l'instant - cliquez sur "Ajouter" pour créer votre première fiche.
        </p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Catégorie</th><th>Région</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {sites.map(site => (
              <tr key={site.id}>
                <td>{site.libelle}</td>
                <td>{site.adresse}</td>
                <td>{site.categorie?.libelle || '-'}</td>
                <td>{site.region?.nom || '-'}</td>
                <td><span className={`status-badge status-badge--${statusColor(site.status)}`}>{statusLabel(site.status)}</span></td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Tarifs" onClick={() => setPrixModal(site)}><Tag size={15} /></button>
                    <button className="admin-icon-btn" title="Galerie" onClick={() => setGalModal(site)}><Image size={15} /></button>
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(site)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer" onClick={() => handleDelete(site.id)}><Trash2 size={15} /></button>
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
              <h2>{modal === 'create' ? 'Créer un site' : 'Modifier le site'}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field"><label>Nom *</label>
                <input value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Adresse *</label>
                <input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} required /></div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Catégorie *</label>
                  <select value={form.id_cat_site} onChange={e => setForm(f => ({ ...f, id_cat_site: e.target.value }))} required>
                    <option value="">Sélectionner...</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                  </select></div>
                <div className="admin-form__field"><label>Région</label>
                  {estGlobal ? (
                    <select value={form.id_region} onChange={e => setForm(f => ({ ...f, id_region: e.target.value }))}>
                      <option value="">Sélectionner...</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                    </select>
                  ) : (
                    <input value={user.region.nom} disabled style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }} />
                  )}
                </div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Latitude *</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required /></div>
                <div className="admin-form__field"><label>Longitude *</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required /></div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Ouverture (HH:MM)</label>
                  <input type="time" value={form.ouverture} onChange={e => setForm(f => ({ ...f, ouverture: e.target.value }))} /></div>
                <div className="admin-form__field"><label>Fermeture (HH:MM)</label>
                  <input type="time" value={form.fermeture} onChange={e => setForm(f => ({ ...f, fermeture: e.target.value }))} /></div>
              </div>
              <div className="admin-form__field"><label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                {modal === 'create'
                  ? "Ce site sera créé en attente - seul un admin peut le valider (pas vous, pas un autre responsable)."
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

      {/* Modal Tarifs */}
      {prixModal && (
        <div className="admin-modal-overlay" onClick={() => setPrixModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Tarifs - {prixModal.libelle}</h2>
              <button onClick={() => setPrixModal(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              {prixModal.prix?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {prixModal.prix.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--gray-100)' }}>
                      <span>{p.libelle} - <strong>{Number(p.montant).toLocaleString('fr-FR')} FCFA</strong></span>
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deletePrix(p.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handlePrix} className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field"><label>Libellé *</label>
                    <input value={prixForm.libelle} onChange={e => setPrixForm(f => ({ ...f, libelle: e.target.value }))} placeholder="Ex: Entrée" required /></div>
                  <div className="admin-form__field"><label>Montant (FCFA) *</label>
                    <input type="number" min="0" value={prixForm.montant} onChange={e => setPrixForm(f => ({ ...f, montant: e.target.value }))} required /></div>
                </div>
                <div className="admin-form__footer">
                  <button type="button" className="btn btn--ghost" onClick={() => setPrixModal(null)}>Fermer</button>
                  <button type="submit" className="btn btn--primary">Ajouter le tarif</button>
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
              <h2>Galerie - {galModal.libelle}</h2>
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
                        onClick={async () => { await responsablesApi.deleteGalerieSite(g.id); load(); setGalModal(s => ({ ...s, galeries: s.galeries.filter(x => x.id !== g.id) })) }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleGalerie} className="admin-form">
                <div className="admin-form__field"><label>Titre de l'image</label>
                  <input value={galLibelle} onChange={e => setGalLibelle(e.target.value)} placeholder="Ex: Vue principale" /></div>
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
