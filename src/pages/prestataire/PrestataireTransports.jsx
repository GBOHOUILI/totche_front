import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, Route } from 'lucide-react'
import { prestatairesApi, regionsApi, villesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'
import LocationPicker from '../../components/map/LocationPicker'
import TagListInput from '../../components/forms/TagListInput'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  latitude: '', longitude: '', type_transport: '', capacite: '', id_region: '',
  points_forts: [], inclus: [], non_inclus: [],
  infos_pratiques: '', recommandations: '', duree_trajet_estimee: '',
}
const emptyTrajetForm = { id_ville_depart: '', id_ville_arrivee: '', horaire_depart: '', prix: '' }

const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning', suspendu: 'danger' })[s] || 'warning'
const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', suspendu: 'Suspendu' })[s] || s

export default function PrestataireTransports() {
  const [transports, setTransports] = useState([])
  const [regions, setRegions] = useState([])
  const [villes, setVilles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [galModal, setGalModal] = useState(null)
  const [galFile, setGalFile] = useState(null)
  const [galLibelle, setGalLibelle] = useState('')
  const [trajetModal, setTrajetModal] = useState(null)
  const [trajetForm, setTrajetForm] = useState(emptyTrajetForm)

  useEffect(() => {
    load()
    regionsApi.list().then(r => setRegions(r.data || []))
    villesApi.list().then(r => setVilles(r.data || []))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await prestatairesApi.mesTransports()
      const data = r.data?.data || r.data || []
      setTransports(data)
      return data
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (transport) => {
    setForm({
      libelle: transport.libelle || '', adresse: transport.adresse || '',
      description: transport.description || '', latitude: transport.latitude || '',
      longitude: transport.longitude || '', type_transport: transport.type_transport || '',
      capacite: transport.capacite || '', id_region: transport.id_region || '',
      points_forts: transport.points_forts || [], inclus: transport.inclus || [], non_inclus: transport.non_inclus || [],
      infos_pratiques: transport.infos_pratiques || '', recommandations: transport.recommandations || '',
      duree_trajet_estimee: transport.duree_trajet_estimee || '',
    })
    setModal(transport)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude !== '' && form.latitude != null ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude !== '' && form.longitude != null ? parseFloat(form.longitude) : undefined,
      capacite: form.capacite ? parseInt(form.capacite) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
      points_forts: form.points_forts.filter(v => v.trim()),
      inclus: form.inclus.filter(v => v.trim()),
      non_inclus: form.non_inclus.filter(v => v.trim()),
      infos_pratiques: form.infos_pratiques || undefined,
      recommandations: form.recommandations || undefined,
      duree_trajet_estimee: form.duree_trajet_estimee || undefined,
    }
    try {
      if (modal === 'create') { await prestatairesApi.createTransport(payload); toast.success('Transport créé - en attente de validation') }
      else { await prestatairesApi.updateTransport(modal.id, payload); toast.success('Transport modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce service de transport ?')) return
    try { await prestatairesApi.deleteTransport(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  const handleGalerie = async (e) => {
    e.preventDefault()
    if (!galFile) return toast.error('Sélectionnez un fichier')
    const fd = new FormData()
    fd.append('fichier', galFile)
    fd.append('libelle', galLibelle || galFile.name)
    fd.append('type', 'image')
    fd.append('id_transport', galModal.id)
    try {
      await prestatairesApi.createGalerieTransport(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const handleTrajet = async (e) => {
    e.preventDefault()
    try {
      await prestatairesApi.createTrajet({
        id_transport: trajetModal.id,
        id_ville_depart: parseInt(trajetForm.id_ville_depart),
        id_ville_arrivee: parseInt(trajetForm.id_ville_arrivee),
        horaire_depart: trajetForm.horaire_depart,
        prix: parseFloat(trajetForm.prix),
      })
      toast.success('Trajet ajouté !')
      setTrajetForm(emptyTrajetForm)
      const fresh = await load()
      setTrajetModal(t => fresh.find(x => x.id === t.id) || t)
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const deleteTrajet = async (id) => {
    try {
      await prestatairesApi.deleteTrajet(id)
      toast.success('Trajet supprimé')
      const fresh = await load()
      setTrajetModal(t => fresh.find(x => x.id === t.id) || t)
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Mes Transports</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : transports.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Aucun service de transport pour l'instant - cliquez sur "Ajouter" pour créer votre première fiche.
        </p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Type</th><th>Région</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {transports.map(transport => (
              <tr key={transport.id}>
                <td>{transport.libelle}</td>
                <td>{transport.adresse}</td>
                <td>{transport.type_transport || '-'}</td>
                <td>{transport.region?.nom || '-'}</td>
                <td><span className={`status-badge status-badge--${statusColor(transport.status)}`}>{statusLabel(transport.status)}</span></td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Trajets" onClick={() => setTrajetModal(transport)}><Route size={15} /></button>
                    <button className="admin-icon-btn" title="Galerie" onClick={() => setGalModal(transport)}><Image size={15} /></button>
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(transport)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer" onClick={() => handleDelete(transport.id)}><Trash2 size={15} /></button>
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
              <h2>{modal === 'create' ? 'Créer un transport' : 'Modifier le transport'}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field"><label>Nom *</label>
                <input value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Adresse *</label>
                <input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} required /></div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Type</label>
                  <input value={form.type_transport} onChange={e => setForm(f => ({ ...f, type_transport: e.target.value }))} placeholder="Ex: Bus" /></div>
                <div className="admin-form__field"><label>Capacité</label>
                  <input type="number" min="1" value={form.capacite} onChange={e => setForm(f => ({ ...f, capacite: e.target.value }))} /></div>
              </div>
              <div className="admin-form__field"><label>Région</label>
                <select value={form.id_region} onChange={e => setForm(f => ({ ...f, id_region: e.target.value }))}>
                  <option value="">Sélectionner...</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                </select></div>
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={({ latitude, longitude }) => setForm(f => ({ ...f, latitude, longitude }))}
              />
              <TagListInput
                label="Points forts"
                value={form.points_forts}
                onChange={v => setForm(f => ({ ...f, points_forts: v }))}
                placeholder="Ex: Climatisé, ponctuel"
              />
              <TagListInput
                label="Ce qui est inclus"
                value={form.inclus}
                onChange={v => setForm(f => ({ ...f, inclus: v }))}
                placeholder="Ex: Bagages inclus, wifi à bord"
              />
              <TagListInput
                label="Non inclus"
                value={form.non_inclus}
                onChange={v => setForm(f => ({ ...f, non_inclus: v }))}
                placeholder="Ex: Repas, bagage supplémentaire"
              />
              <div className="admin-form__field"><label>Durée de trajet estimée</label>
                <input type="text" value={form.duree_trajet_estimee} onChange={e => setForm(f => ({ ...f, duree_trajet_estimee: e.target.value }))} placeholder="Ex: 45 min" /></div>
              <div className="admin-form__field"><label>Infos pratiques</label>
                <textarea rows={3} value={form.infos_pratiques} onChange={e => setForm(f => ({ ...f, infos_pratiques: e.target.value }))} placeholder="Ex: Arriver 15 min avant le départ" /></div>
              <div className="admin-form__field"><label>Recommandations</label>
                <textarea rows={3} value={form.recommandations} onChange={e => setForm(f => ({ ...f, recommandations: e.target.value }))} placeholder="Ex: Prévoir une pièce d'identité" /></div>
              <div className="admin-form__field"><label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                {modal === 'create'
                  ? "Ce transport sera créé en attente - il deviendra visible publiquement une fois validé."
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

      {/* Modal Trajets */}
      {trajetModal && (
        <div className="admin-modal-overlay" onClick={() => setTrajetModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Trajets - {trajetModal.libelle}</h2>
              <button onClick={() => setTrajetModal(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              {trajetModal.trajets?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {trajetModal.trajets.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--gray-100)' }}>
                      <span>{t.ville_depart?.nom} → {t.ville_arrivee?.nom} · {t.horaire_depart?.slice(0, 5)} - <strong>{Number(t.prix).toLocaleString('fr-FR')} FCFA</strong></span>
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deleteTrajet(t.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleTrajet} className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field"><label>Ville départ *</label>
                    <select value={trajetForm.id_ville_depart} onChange={e => setTrajetForm(f => ({ ...f, id_ville_depart: e.target.value }))} required>
                      <option value="">Sélectionner...</option>
                      {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                    </select></div>
                  <div className="admin-form__field"><label>Ville arrivée *</label>
                    <select value={trajetForm.id_ville_arrivee} onChange={e => setTrajetForm(f => ({ ...f, id_ville_arrivee: e.target.value }))} required>
                      <option value="">Sélectionner...</option>
                      {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                    </select></div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field"><label>Heure de départ *</label>
                    <input type="time" value={trajetForm.horaire_depart} onChange={e => setTrajetForm(f => ({ ...f, horaire_depart: e.target.value }))} required /></div>
                  <div className="admin-form__field"><label>Prix (FCFA) *</label>
                    <input type="number" min="0" value={trajetForm.prix} onChange={e => setTrajetForm(f => ({ ...f, prix: e.target.value }))} required /></div>
                </div>
                <div className="admin-form__footer">
                  <button type="button" className="btn btn--ghost" onClick={() => setTrajetModal(null)}>Fermer</button>
                  <button type="submit" className="btn btn--primary">Ajouter le trajet</button>
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
                        onClick={async () => { await prestatairesApi.deleteGalerieTransport(g.id); load(); setGalModal(t => ({ ...t, galeries: t.galeries.filter(x => x.id !== g.id) })) }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleGalerie} className="admin-form">
                <div className="admin-form__field"><label>Titre de l'image</label>
                  <input value={galLibelle} onChange={e => setGalLibelle(e.target.value)} placeholder="Ex: Véhicule" /></div>
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
