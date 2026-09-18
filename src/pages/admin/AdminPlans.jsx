import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { plansApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const emptyForm = { nom: '', prix_mensuel: '', nombre_fiches_max: '', fonctionnalites: '' }

// fonctionnalites est un JSON array côté API ; édité ici comme une liste séparée
// par des retours à la ligne pour rester simple côté formulaire.
const toFonctionnalites = (text) =>
  text.split('\n').map(s => s.trim()).filter(Boolean)

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = () => {
    setLoading(true)
    plansApi.list().then(r => setPlans(r.data || [])).finally(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (plan) => {
    setEditing(plan)
    setForm({
      nom: plan.nom,
      prix_mensuel: plan.prix_mensuel,
      nombre_fiches_max: plan.nombre_fiches_max ?? '',
      fonctionnalites: (plan.fonctionnalites || []).join('\n'),
    })
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nom: form.nom,
      prix_mensuel: Number(form.prix_mensuel),
      nombre_fiches_max: form.nombre_fiches_max ? Number(form.nombre_fiches_max) : null,
      fonctionnalites: toFonctionnalites(form.fonctionnalites),
    }
    try {
      if (editing) await plansApi.update(editing.id, payload)
      else await plansApi.create(payload)
      toast.success(editing ? 'Plan mis à jour !' : 'Plan créé !')
      setModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(msg => toast.error(msg))
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plan ?')) return
    try {
      await plansApi.delete(id)
      toast.success('Plan supprimé.')
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
          <h1>Plans d'abonnement</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {plans.length} plan(s) - proposés aux prestataires dans leur portail
          </p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter un plan</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Prix / mois</th>
              <th>Fiches max</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun plan</td></tr>
            ) : plans.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.nom}</td>
                <td>{Number(p.prix_mensuel).toLocaleString('fr-FR')} FCFA</td>
                <td>{p.nombre_fiches_max ?? 'Illimité'}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn" title="Modifier" onClick={() => openEdit(p)}><Pencil size={15} /></button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer"
                      onClick={() => handleDelete(p.id)}><Trash2 size={15} /></button>
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
              <h2>{editing ? 'Modifier le plan' : 'Nouveau plan'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__field">
                <label>Nom *</label>
                <input {...field('nom')} placeholder="Starter" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="admin-form__field">
                  <label>Prix mensuel (FCFA) *</label>
                  <input type="number" min="0" step="0.01" {...field('prix_mensuel')} required />
                </div>
                <div className="admin-form__field">
                  <label>Fiches max</label>
                  <input type="number" min="1" {...field('nombre_fiches_max')} placeholder="Vide = illimité" />
                </div>
              </div>
              <div className="admin-form__field">
                <label>Fonctionnalités (une par ligne)</label>
                <textarea {...field('fonctionnalites')} rows={4} placeholder={'5 fiches\nSupport email'} />
              </div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
