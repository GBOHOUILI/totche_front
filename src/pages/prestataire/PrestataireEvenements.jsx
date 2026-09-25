import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, Tag } from 'lucide-react'
import { prestatairesApi, categoriesApi, regionsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'
import LocationPicker from '../../components/map/LocationPicker'
import TagListInput from '../../components/forms/TagListInput'
import ItineraryEditor from '../../components/forms/ItineraryEditor'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  id_cat_evenmt: '', date_debut: '', date_fin: '',
  latitude: '', longitude: '', id_region: '',
  points_forts: [], inclus: [], non_inclus: [],
  infos_pratiques: '', recommandations: '', itineraire: [],
  groupe_min: '', groupe_max: '', langue: '', difficulte: '',
}
const emptyPrixForm = { libelle: '', montant: '' }

const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning', suspendu: 'danger' })[s] || 'warning'
const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', suspendu: 'Suspendu' })[s] || s

export default function PrestataireEvenements() {
  const [events, setEvents] = useState([])
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
    load(); categoriesApi.evenements().then(r => setCats(r.data?.data || r.data || []))
    regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await prestatairesApi.mesEvenements()
      const data = r.data?.data || r.data || []
      setEvents(data)
      return data
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (evt) => {
    setForm({
      libelle: evt.libelle || '', adresse: evt.adresse || '',
      description: evt.description || '', id_cat_evenmt: evt.id_cat_evenmt || '',
      date_debut: evt.date_debut?.split('T')[0] || '',
      date_fin: evt.date_fin?.split('T')[0] || '',
      latitude: evt.latitude || '', longitude: evt.longitude || '',
      id_region: evt.id_region || '',
      points_forts: evt.points_forts || [], inclus: evt.inclus || [], non_inclus: evt.non_inclus || [],
      infos_pratiques: evt.infos_pratiques || '', recommandations: evt.recommandations || '',
      itineraire: evt.itineraire || [],
      groupe_min: evt.groupe_min ?? '', groupe_max: evt.groupe_max ?? '',
      langue: evt.langue || '', difficulte: evt.difficulte || '',
    })
    setModal(evt)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude !== '' && form.latitude != null ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude !== '' && form.longitude != null ? parseFloat(form.longitude) : undefined,
      id_cat_evenmt: form.id_cat_evenmt ? parseInt(form.id_cat_evenmt) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
      points_forts: form.points_forts.filter(v => v.trim()),
      inclus: form.inclus.filter(v => v.trim()),
      non_inclus: form.non_inclus.filter(v => v.trim()),
      infos_pratiques: form.infos_pratiques || undefined,
      recommandations: form.recommandations || undefined,
      itineraire: form.itineraire.filter(s => s.titre?.trim() && s.description?.trim()),
      groupe_min: form.groupe_min !== '' ? parseInt(form.groupe_min) : undefined,
      groupe_max: form.groupe_max !== '' ? parseInt(form.groupe_max) : undefined,
      langue: form.langue || undefined,
      difficulte: form.difficulte || undefined,
    }
    try {
      if (modal === 'create') { await prestatairesApi.createEvenement(payload); toast.success('Événement créé - en attente de validation') }
      else { await prestatairesApi.updateEvenement(modal.id, payload); toast.success('Événement modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return
    try { await prestatairesApi.deleteEvenement(id); toast.success('Supprimé'); load() }
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
    try {
      await prestatairesApi.createGalerieEvenement(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle(''); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const handlePrix = async (e) => {
    e.preventDefault()
    try {
      await prestatairesApi.createPrix({ libelle: prixForm.libelle, montant: parseFloat(prixForm.montant), id_evnmt: prixModal.id })
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
        <h1>Mes Événements</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : events.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Aucun événement pour l'instant - cliquez sur "Ajouter" pour créer votre première fiche.
        </p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Date début</th><th>Région</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map(evt => (
              <tr key={evt.id}>
                <td>{evt.libelle}</td>
                <td>{evt.adresse}</td>
                <td>{evt.date_debut ? new Date(evt.date_debut).toLocaleDateString('fr-FR') : '-'}</td>
                <td>{evt.region?.nom || '-'}</td>
                <td><span className={`status-badge status-badge--${statusColor(evt.status)}`}>{statusLabel(evt.status)}</span></td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Tarifs" onClick={() => setPrixModal(evt)}><Tag size={15} /></button>
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
                    <option value="">Sélectionner...</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                  </select></div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Date début *</label>
                  <input type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} required /></div>
                <div className="admin-form__field"><label>Date fin *</label>
                  <input type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} required /></div>
              </div>
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={({ latitude, longitude }) => setForm(f => ({ ...f, latitude, longitude }))}
              />
              <TagListInput
                label="Points forts"
                value={form.points_forts}
                onChange={v => setForm(f => ({ ...f, points_forts: v }))}
                placeholder="Ex: Ambiance festive, artisanat local"
              />
              <TagListInput
                label="Ce qui est inclus"
                value={form.inclus}
                onChange={v => setForm(f => ({ ...f, inclus: v }))}
                placeholder="Ex: Accès à l'événement, animation"
              />
              <TagListInput
                label="Non inclus"
                value={form.non_inclus}
                onChange={v => setForm(f => ({ ...f, non_inclus: v }))}
                placeholder="Ex: Transport, hébergement"
              />
              <ItineraryEditor
                value={form.itineraire}
                onChange={v => setForm(f => ({ ...f, itineraire: v }))}
              />
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Groupe min.</label>
                  <input type="number" min="1" value={form.groupe_min} onChange={e => setForm(f => ({ ...f, groupe_min: e.target.value }))} /></div>
                <div className="admin-form__field"><label>Groupe max.</label>
                  <input type="number" min="1" value={form.groupe_max} onChange={e => setForm(f => ({ ...f, groupe_max: e.target.value }))} /></div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Langue</label>
                  <input type="text" value={form.langue} onChange={e => setForm(f => ({ ...f, langue: e.target.value }))} placeholder="Ex: Français, Fon" /></div>
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
                  ? "Cet événement sera créé en attente - il deviendra visible publiquement une fois validé."
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
                    <input value={prixForm.libelle} onChange={e => setPrixForm(f => ({ ...f, libelle: e.target.value }))} placeholder="Ex: Billet Standard" required /></div>
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
