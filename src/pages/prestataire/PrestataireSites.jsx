import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, Tag, MessageCircleQuestion } from 'lucide-react'
import { prestatairesApi, categoriesApi, regionsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'
import LocationPicker from '../../components/map/LocationPicker'
import TagListInput from '../../components/forms/TagListInput'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  id_cat_site: '', latitude: '', longitude: '',
  ouverture: '', fermeture: '', id_region: '',
  points_forts: [], inclus: [], non_inclus: [], duree_visite: '', difficulte: '',
  infos_pratiques: '', recommandations: '',
}
const emptyPrixForm = { libelle: '', montant: '' }

const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning', suspendu: 'danger', precisions_demandees: 'info' })[s] || 'warning'
const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', suspendu: 'Suspendu', precisions_demandees: 'Précisions demandées' })[s] || s

export default function PrestataireSites() {
  const [sites, setSites] = useState([])
  const [cats, setCats] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | site object
  const [form, setForm] = useState(emptyForm)
  const [galModal, setGalModal] = useState(null)
  const [galFile, setGalFile] = useState(null)
  const [galLibelle, setGalLibelle] = useState('')
  const [prixModal, setPrixModal] = useState(null) // site object
  const [prixForm, setPrixForm] = useState(emptyPrixForm)

  useEffect(() => {
    load(); categoriesApi.sites().then(r => setCats(r.data?.data || r.data || []))
    regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await prestatairesApi.mesSites()
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
      points_forts: site.points_forts || [], inclus: site.inclus || [], non_inclus: site.non_inclus || [],
      duree_visite: site.duree_visite || '', difficulte: site.difficulte || '',
      infos_pratiques: site.infos_pratiques || '', recommandations: site.recommandations || '',
    })
    setModal(site)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude !== '' && form.latitude != null ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude !== '' && form.longitude != null ? parseFloat(form.longitude) : undefined,
      id_cat_site: form.id_cat_site ? parseInt(form.id_cat_site) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
      points_forts: form.points_forts.filter(v => v.trim()),
      inclus: form.inclus.filter(v => v.trim()),
      non_inclus: form.non_inclus.filter(v => v.trim()),
      duree_visite: form.duree_visite || undefined,
      difficulte: form.difficulte || undefined,
      infos_pratiques: form.infos_pratiques || undefined,
      recommandations: form.recommandations || undefined,
    }
    try {
      if (modal === 'create') { await prestatairesApi.createSite(payload); toast.success('Site créé - en attente de validation') }
      else { await prestatairesApi.updateSite(modal.id, payload); toast.success('Site modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce site ?')) return
    try { await prestatairesApi.deleteSite(id); toast.success('Supprimé'); load() }
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
      await prestatairesApi.createGalerieSite(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const handlePrix = async (e) => {
    e.preventDefault()
    try {
      await prestatairesApi.createPrix({ libelle: prixForm.libelle, montant: parseFloat(prixForm.montant), id_site: prixModal.id })
      toast.success('Tarif ajouté !')
      setPrixForm(emptyPrixForm)
      const fresh = await load()
      setPrixModal(s => fresh.find(x => x.id === s.id) || s)
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const deletePrix = async (id) => {
    try {
      await prestatairesApi.deletePrix(id)
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
                <td>
                  <span className={`status-badge status-badge--${statusColor(site.status)}`}>{statusLabel(site.status)}</span>
                  {site.commentaire_responsable && (
                    <div className="precisions-note"><MessageCircleQuestion size={14} /><span>{site.commentaire_responsable}</span></div>
                  )}
                </td>
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
                  <select value={form.id_region} onChange={e => setForm(f => ({ ...f, id_region: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                  </select></div>
              </div>
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={({ latitude, longitude }) => setForm(f => ({ ...f, latitude, longitude }))}
              />
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Ouverture (HH:MM)</label>
                  <input type="time" value={form.ouverture} onChange={e => setForm(f => ({ ...f, ouverture: e.target.value }))} /></div>
                <div className="admin-form__field"><label>Fermeture (HH:MM)</label>
                  <input type="time" value={form.fermeture} onChange={e => setForm(f => ({ ...f, fermeture: e.target.value }))} /></div>
              </div>
              <TagListInput
                label="Points forts"
                value={form.points_forts}
                onChange={v => setForm(f => ({ ...f, points_forts: v }))}
                placeholder="Ex: Vue imprenable sur la lagune"
              />
              <TagListInput
                label="Ce que le billet inclut"
                value={form.inclus}
                onChange={v => setForm(f => ({ ...f, inclus: v }))}
                placeholder="Ex: Accès au site, parking"
              />
              <TagListInput
                label="Non inclus"
                value={form.non_inclus}
                onChange={v => setForm(f => ({ ...f, non_inclus: v }))}
                placeholder="Ex: Guide privé, transport"
              />
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Durée de visite</label>
                  <input type="text" value={form.duree_visite} onChange={e => setForm(f => ({ ...f, duree_visite: e.target.value }))} placeholder="Ex: 2h, Demi-journée" /></div>
                <div className="admin-form__field"><label>Difficulté</label>
                  <select value={form.difficulte} onChange={e => setForm(f => ({ ...f, difficulte: e.target.value }))}>
                    <option value="">Non précisée</option>
                    <option value="facile">Facile</option>
                    <option value="moderee">Modérée</option>
                    <option value="difficile">Difficile</option>
                  </select></div>
              </div>
              <div className="admin-form__field"><label>Infos pratiques</label>
                <textarea rows={3} value={form.infos_pratiques} onChange={e => setForm(f => ({ ...f, infos_pratiques: e.target.value }))} placeholder="Ex: Prévoir de l'eau, chaussures fermées recommandées" /></div>
              <div className="admin-form__field"><label>Recommandations</label>
                <textarea rows={3} value={form.recommandations} onChange={e => setForm(f => ({ ...f, recommandations: e.target.value }))} placeholder="Ex: Meilleure période : novembre à février" /></div>
              <div className="admin-form__field"><label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                {modal === 'create'
                  ? "Ce site sera créé en attente - il deviendra visible publiquement une fois validé."
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
                    <input value={prixForm.libelle} onChange={e => setPrixForm(f => ({ ...f, libelle: e.target.value }))} placeholder="Ex: Chambre double" required /></div>
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
                        onClick={async () => { await prestatairesApi.deleteGalerieSite(g.id); load(); setGalModal(s => ({ ...s, galeries: s.galeries.filter(x => x.id !== g.id) })) }}
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
