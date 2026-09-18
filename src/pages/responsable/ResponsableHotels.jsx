import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, BedDouble } from 'lucide-react'
import { responsablesApi, regionsApi } from '../../api/services'
import { Spinner, Stars } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const emptyForm = {
  libelle: '', adresse: '', description: '',
  latitude: '', longitude: '', nombre_etoiles: '', id_region: '',
}
const emptyChambreForm = { type_chambre: '', prix_nuit: '', capacite: '', disponibilite: true }

const statusColor = (s) => ({ valide: 'success', rejete: 'danger', en_attente: 'warning', suspendu: 'danger' })[s] || 'warning'
const statusLabel = (s) => ({ valide: 'Validé', rejete: 'Rejeté', en_attente: 'En attente', suspendu: 'Suspendu' })[s] || s

export default function ResponsableHotels() {
  const { user } = useAuth()
  const estGlobal = !user?.region
  const [hotels, setHotels] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [galModal, setGalModal] = useState(null)
  const [galFile, setGalFile] = useState(null)
  const [galLibelle, setGalLibelle] = useState('')
  const [chambreModal, setChambreModal] = useState(null)
  const [chambreForm, setChambreForm] = useState(emptyChambreForm)

  useEffect(() => {
    load()
    if (estGlobal) regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await responsablesApi.mesHotels()
      const data = r.data?.data || r.data || []
      setHotels(data)
      return data
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (hotel) => {
    setForm({
      libelle: hotel.libelle || '', adresse: hotel.adresse || '',
      description: hotel.description || '', latitude: hotel.latitude || '',
      longitude: hotel.longitude || '', nombre_etoiles: hotel.nombre_etoiles || '',
      id_region: hotel.id_region || '',
    })
    setModal(hotel)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      nombre_etoiles: form.nombre_etoiles ? parseInt(form.nombre_etoiles) : undefined,
      id_region: form.id_region ? parseInt(form.id_region) : undefined,
    }
    try {
      if (modal === 'create') { await responsablesApi.createHotel(payload); toast.success('Hôtel créé — seul un admin peut le valider') }
      else { await responsablesApi.updateHotel(modal.id, payload); toast.success('Hôtel modifié !') }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) toast.error(Object.values(errors).flat().join(' | '))
      else toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet hôtel ?')) return
    try { await responsablesApi.deleteHotel(id); toast.success('Supprimé'); load() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  const handleGalerie = async (e) => {
    e.preventDefault()
    if (!galFile) return toast.error('Sélectionnez un fichier')
    const fd = new FormData()
    fd.append('fichier', galFile)
    fd.append('libelle', galLibelle || galFile.name)
    fd.append('type', 'image')
    fd.append('id_hotel', galModal.id)
    try {
      await responsablesApi.createGalerieHotel(fd)
      toast.success('Image ajoutée !')
      setGalModal(null); setGalFile(null); setGalLibelle('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur upload') }
  }

  const handleChambre = async (e) => {
    e.preventDefault()
    try {
      await responsablesApi.createChambre({
        id_hotel: chambreModal.id,
        type_chambre: chambreForm.type_chambre,
        prix_nuit: parseFloat(chambreForm.prix_nuit),
        capacite: chambreForm.capacite ? parseInt(chambreForm.capacite) : undefined,
        disponibilite: chambreForm.disponibilite,
      })
      toast.success('Chambre ajoutée !')
      setChambreForm(emptyChambreForm)
      const fresh = await load()
      setChambreModal(h => fresh.find(x => x.id === h.id) || h)
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const deleteChambre = async (id) => {
    try {
      await responsablesApi.deleteChambre(id)
      toast.success('Chambre supprimée')
      const fresh = await load()
      setChambreModal(h => fresh.find(x => x.id === h.id) || h)
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Mes Hôtels</h1>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : hotels.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Aucun hôtel pour l'instant — cliquez sur "Ajouter" pour créer votre première fiche.
        </p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Étoiles</th><th>Région</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {hotels.map(hotel => (
              <tr key={hotel.id}>
                <td>{hotel.libelle}</td>
                <td>{hotel.adresse}</td>
                <td>{hotel.nombre_etoiles ? <Stars value={hotel.nombre_etoiles} size={12} /> : '—'}</td>
                <td>{hotel.region?.nom || '—'}</td>
                <td><span className={`status-badge status-badge--${statusColor(hotel.status)}`}>{statusLabel(hotel.status)}</span></td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Chambres" onClick={() => setChambreModal(hotel)}><BedDouble size={15} /></button>
                    <button className="admin-icon-btn" title="Galerie" onClick={() => setGalModal(hotel)}><Image size={15} /></button>
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(hotel)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer" onClick={() => handleDelete(hotel.id)}><Trash2 size={15} /></button>
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
              <h2>{modal === 'create' ? 'Créer un hôtel' : "Modifier l'hôtel"}</h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field"><label>Nom *</label>
                <input value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required /></div>
              <div className="admin-form__field"><label>Adresse *</label>
                <input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} required /></div>
              <div className="admin-form__row">
                <div className="admin-form__field"><label>Étoiles</label>
                  <select value={form.nombre_etoiles} onChange={e => setForm(f => ({ ...f, nombre_etoiles: e.target.value }))}>
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
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
              <div className="admin-form__field"><label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                {modal === 'create'
                  ? "Cet hôtel sera créé en attente — seul un admin peut le valider (pas vous, pas un autre responsable)."
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

      {/* Modal Chambres */}
      {chambreModal && (
        <div className="admin-modal-overlay" onClick={() => setChambreModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Chambres — {chambreModal.libelle}</h2>
              <button onClick={() => setChambreModal(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              {chambreModal.chambres?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {chambreModal.chambres.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--gray-100)' }}>
                      <span>{c.type_chambre} — <strong>{Number(c.prix_nuit).toLocaleString('fr-FR')} FCFA/nuit</strong> {c.capacite && `· ${c.capacite} pers.`}</span>
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deleteChambre(c.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleChambre} className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field"><label>Type *</label>
                    <input value={chambreForm.type_chambre} onChange={e => setChambreForm(f => ({ ...f, type_chambre: e.target.value }))} placeholder="Ex: Deluxe" required /></div>
                  <div className="admin-form__field"><label>Prix/nuit (FCFA) *</label>
                    <input type="number" min="0" value={chambreForm.prix_nuit} onChange={e => setChambreForm(f => ({ ...f, prix_nuit: e.target.value }))} required /></div>
                </div>
                <div className="admin-form__field"><label>Capacité</label>
                  <input type="number" min="1" value={chambreForm.capacite} onChange={e => setChambreForm(f => ({ ...f, capacite: e.target.value }))} /></div>
                <div className="admin-form__footer">
                  <button type="button" className="btn btn--ghost" onClick={() => setChambreModal(null)}>Fermer</button>
                  <button type="submit" className="btn btn--primary">Ajouter la chambre</button>
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
                        onClick={async () => { await responsablesApi.deleteGalerieHotel(g.id); load(); setGalModal(h => ({ ...h, galeries: h.galeries.filter(x => x.id !== g.id) })) }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleGalerie} className="admin-form">
                <div className="admin-form__field"><label>Titre de l'image</label>
                  <input value={galLibelle} onChange={e => setGalLibelle(e.target.value)} placeholder="Ex: Façade" /></div>
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
