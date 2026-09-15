import { useState, useEffect } from 'react'
import { User, Phone, Globe, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usersApi, authApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

export default function Profil() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ nom: '', prenom: '', tel: '', nationalite: '' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || user.name || '',
        prenom: user.prenom || '',
        tel: user.tel || user.telephone || '',
        nationalite: user.nationalite || '',
      })
    }
  }, [user])

  const handleProfile = async (e) => {
    e.preventDefault()
    if (!user?.id) return toast.error('Utilisateur introuvable')
    setSavingProfile(true)
    try {
      await usersApi.update(user.id, form)
      // Mettre à jour le localStorage
      const updated = { ...user, ...form }
      localStorage.setItem('user', JSON.stringify(updated))
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
      await authApi.updatePassword(pwdForm)
      toast.success('Mot de passe modifié !')
      setPwdForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mot de passe actuel incorrect')
    } finally { setSavingPwd(false) }
  }

  return (
    <div className="page-profil">
      <div className="page-hero page-hero--sm">
        <h1>Mon Profil</h1>
      </div>

      <div className="container">
        <div className="profil-layout">
          {/* Sidebar */}
          <aside className="profil-sidebar">
            <div className="profil-avatar">
              {user?.nom?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || <User size={32} />}
            </div>
            <h2>{user?.nom} {user?.prenom}</h2>
            <p>{user?.email}</p>
            <ul className="profil-meta">
              {(user?.tel || user?.telephone) && <li><Phone size={14} />{user.tel || user.telephone}</li>}
              {user?.nationalite && <li><Globe size={14} />{user.nationalite}</li>}
            </ul>
          </aside>

          {/* Forms */}
          <div className="profil-forms">
            {/* Infos personnelles */}
            <div className="profil-card">
              <h3><User size={18} /> Informations personnelles</h3>
              <form onSubmit={handleProfile} className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label>Nom</label>
                    <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                  <div className="admin-form__field">
                    <label>Prénom</label>
                    <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                  </div>
                </div>
                <div className="admin-form__field">
                  <label>Téléphone</label>
                  <input value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
                </div>
                <div className="admin-form__field">
                  <label>Nationalité</label>
                  <input value={form.nationalite} onChange={e => setForm(f => ({ ...f, nationalite: e.target.value }))} />
                </div>
                <div className="admin-form__footer">
                  <button type="submit" className="btn btn--primary" disabled={savingProfile}>
                    {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>

            {/* Mot de passe */}
            <div className="profil-card">
              <h3><Lock size={18} /> Changer le mot de passe</h3>
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
      </div>
    </div>
  )
}