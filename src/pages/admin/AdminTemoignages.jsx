import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { temoignagesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const emptyForm = { nom: '', role: '', message: '', actif: true }

export default function AdminTemoignages() {
  const [temoignages, setTemoignages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = () => {
    setLoading(true)
    temoignagesApi.adminList().then(r => setTemoignages(r.data || [])).finally(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setPhotoFile(null); setModal(true) }
  const openEdit = (t) => {
    setEditing(t)
    setForm({ nom: t.nom, role: t.role, message: t.message, actif: !!t.actif })
    setPhotoFile(null)
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData()
    formData.append('nom', form.nom)
    formData.append('role', form.role)
    formData.append('message', form.message)
    formData.append('actif', form.actif ? '1' : '0')
    if (photoFile) formData.append('photo', photoFile)
    try {
      if (editing) await temoignagesApi.update(editing.id, formData)
      else await temoignagesApi.create(formData)
      toast.success(editing ? 'Témoignage mis à jour !' : 'Témoignage créé !')
      setModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(msg => toast.error(msg))
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce témoignage ?')) return
    try {
      await temoignagesApi.delete(id)
      toast.success('Témoignage supprimé.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur lors de la suppression') }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Témoignages</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {temoignages.length} témoignage(s) - section "Ce que pensent nos utilisateurs" sur l'Accueil
          </p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter un témoignage</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Message</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {temoignages.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun témoignage</td></tr>
            ) : temoignages.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td style={{ fontWeight: 600 }}>{t.nom}</td>
                <td>{t.role}</td>
                <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.message}</td>
                <td>
                  <span className={`status-badge status-badge--${t.actif ? 'success' : 'warning'}`}>
                    {t.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(t)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer"
                      onClick={() => handleDelete(t.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{editing ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field">
                <label>Nom *</label>
                <input {...field('nom')} placeholder="Marie Dossou" required />
              </div>
              <div className="admin-form__field">
                <label>Rôle *</label>
                <input {...field('role')} placeholder="Prestataire, Touriste, Responsable régional..." required />
              </div>
              <div className="admin-form__field">
                <label>Message *</label>
                <textarea {...field('message')} rows={4} required />
              </div>
              <div className="admin-form__field">
                <label>Photo {editing?.photo && '(laisser vide pour garder la photo actuelle)'}</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
              <div className="admin-form__field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} />
                  Actif (visible sur l'Accueil)
                </label>
              </div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le témoignage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
