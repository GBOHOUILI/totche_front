import { useState, useEffect } from 'react'
import { Plus, Trash2, ShieldCheck, X, Eye, EyeOff } from 'lucide-react'
import { adminResponsablesApi, regionsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const emptyForm = { nom: '', prenom: '', tel: '', password: '', password_confirmation: '', id_region: '' }

export default function AdminResponsables() {
  const [responsables, setResponsables] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    regionsApi.list().then(r => setRegions(r.data || []))
  }, [])

  const load = () => {
    setLoading(true)
    adminResponsablesApi.list()
      .then(r => setResponsables(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }

  const openCreate = () => { setForm(emptyForm); setModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    try {
      await adminResponsablesApi.create({ ...form, id_region: form.id_region || undefined })
      toast.success('Responsable créé !')
      setModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(msg => toast.error(msg))
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce responsable ? Cette action est irréversible.')) return
    try {
      await adminResponsablesApi.delete(id)
      toast.success('Responsable supprimé.')
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
          <h1>Responsables régionaux</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {responsables.length} compte(s) - valident les sites/événements de leur région
          </p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Ajouter un responsable</button>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Région</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {responsables.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun responsable régional</td></tr>
            ) : responsables.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={14} color="white" />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.nom} {r.prenom || ''}</p>
                  </div>
                </td>
                <td>{r.tel || '-'}</td>
                <td>{r.region?.nom || <em style={{ color: 'var(--gray-500)' }}>Toutes régions</em>}</td>
                <td>
                  <span className={`status-badge status-badge--${r.status ? 'success' : 'danger'}`}>
                    {r.status ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer"
                      onClick={() => handleDelete(r.id)}><Trash2 size={15} /></button>
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
              <h2>Nouveau responsable régional</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="admin-form__field">
                  <label>Nom *</label>
                  <input {...field('nom')} placeholder="Dossou" required />
                </div>
                <div className="admin-form__field">
                  <label>Prénom *</label>
                  <input {...field('prenom')} placeholder="Marie" required />
                </div>
              </div>
              <div className="admin-form__field">
                <label>Téléphone *</label>
                <input type="tel" {...field('tel')} placeholder="+229 01 00 00 00" required />
              </div>
              <div className="admin-form__field">
                <label>Région</label>
                <select {...field('id_region')}>
                  <option value="">Toutes régions (responsable global)</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                </select>
              </div>
              <div className="admin-form__field">
                <label>Mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    {...field('password')}
                    placeholder="Minimum 6 caractères"
                    required minLength={6}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="admin-form__field">
                <label>Confirmer le mot de passe *</label>
                <input type={showPwd ? 'text' : 'password'} {...field('password_confirmation')} placeholder="Répétez le mot de passe" required />
              </div>
              <div className="admin-form__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Création…' : 'Créer le responsable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
