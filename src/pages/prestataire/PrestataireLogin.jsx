import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function PrestataireLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { loginPrestataire, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await loginPrestataire(form)
    if (res.success) { toast.success('Bienvenue !'); navigate('/prestataire') }
    else toast.error(res.message)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__icon"><Briefcase size={32} /></div>
        <h1>Espace Prestataire</h1>
        <p className="auth-card__sub">Gérez vos fiches, tarifs et réservations</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__field">
            <label>Email *</label>
            <input type="email" placeholder="contact@monentreprise.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="auth-form__field">
            <label>Mot de Passe *</label>
            <div className="auth-form__pwd">
              <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--full auth-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>
        </form>
        <p className="auth-card__switch">
          <Link to="/mot-de-passe-oublie/prestataire">Mot de passe oublié ?</Link>
        </p>
        <p className="auth-card__switch">Pas encore de compte pro ? <Link to="/prestataire/inscription">Créer un compte</Link></p>
      </div>
    </div>
  )
}
