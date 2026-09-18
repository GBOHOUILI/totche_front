import { useState, useEffect } from 'react'
import { Briefcase, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { prestatairesApi } from '../../api/services'
import toast from 'react-hot-toast'

const TYPES = [
  { value: 'hotel', label: 'Hôtel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'transport', label: 'Transport' },
  { value: 'site', label: 'Site touristique' },
  { value: 'evenement', label: "Organisateur d'événements" },
]

export default function PrestataireProfil() {
  const { user } = useAuth()
  const [form, setForm] = useState({ nom_entreprise: '', type_prestataire: '', email: '', tel: '' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        nom_entreprise: user.nom_entreprise || '',
        type_prestataire: user.type_prestataire || '',
        email: user.email || '',
        tel: user.tel || '',
      })
    }
  }, [user])

  const handleProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { data } = await prestatairesApi.updateProfil(form)
      localStorage.setItem('user', JSON.stringify({ ...data, role: 'prestataire' }))
      toast.success('Profil mis à jour !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally { setSavingProfile(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.password !== pwdForm.password_confirmation) {
      return toast.error('Les mots de passe ne correspondent pas')
    }
    setSavingPwd(true)
    try {
      await prestatairesApi.updatePassword(pwdForm)
      toast.success('Mot de passe modifié ! Reconnectez-vous.')
      setPwdForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mot de passe actuel incorrect')
    } finally { setSavingPwd(false) }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Mon Profil</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-section">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={16} /> Informations de l'entreprise
          </h2>
          <form onSubmit={handleProfile} className="admin-form">
            <div className="admin-form__field">
              <label>Nom de l'entreprise</label>
              <input value={form.nom_entreprise} onChange={e => setForm(f => ({ ...f, nom_entreprise: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label>Type d'activité</label>
              <select value={form.type_prestataire} onChange={e => setForm(f => ({ ...f, type_prestataire: e.target.value }))}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="admin-form__field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label>Téléphone</label>
              <input value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
            </div>
            <div className="admin-form__footer">
              <button type="submit" className="btn btn--primary" disabled={savingProfile}>
                {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-section">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={16} /> Changer le mot de passe
          </h2>
          <form onSubmit={handlePassword} className="admin-form">
            <div className="admin-form__field">
              <label>Mot de passe actuel</label>
              <div className="auth-form__pwd">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pwdForm.current_password}
                  onChange={e => setPwdForm(f => ({ ...f, current_password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="admin-form__field">
              <label>Nouveau mot de passe</label>
              <input type="password" placeholder="••••••••"
                value={pwdForm.password} onChange={e => setPwdForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="admin-form__field">
              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" placeholder="••••••••"
                value={pwdForm.password_confirmation} onChange={e => setPwdForm(f => ({ ...f, password_confirmation: e.target.value }))} />
            </div>
            <div className="admin-form__footer">
              <button type="submit" className="btn btn--primary" disabled={savingPwd}>
                {savingPwd ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
