import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ─── LOGIN ────────────────────────────────────────────────
export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await login(form)
    if (res.success) { toast.success('Bienvenue !'); navigate('/') }
    else toast.error(res.message)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__icon"><User size={32} /></div>
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__field">
            <label>Email *</label>
            <input type="email" placeholder="john@example.com" value={form.email}
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
            {loading ? 'Connexion...' : 'CONNEXION'}
          </button>
        </form>
        <p className="auth-card__switch">Pas encore de compte ? <Link to="/inscription">Inscription</Link></p>
      </div>
    </div>
  )
}

// ─── REGISTER ─────────────────────────────────────────────
// Champs backend : nom, prenom, tel, email, password, password_confirmation, nationalite
export function Register() {
  const [form, setForm] = useState({ nom: '', prenom: '', tel: '', email: '', password: '', password_confirmation: '', nationalite: '' })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await register(form)
    if (res.success) { toast.success('Compte créé !'); navigate('/') }
    else { toast.error(res.message); if (res.errors) setErrors(res.errors) }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="auth-form__field">
      <label>{label} *</label>
      <input type={type} placeholder={placeholder || label} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
      {errors[key] && <span className="auth-form__error">{errors[key][0]}</span>}
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__icon"><User size={32} /></div>
        <h1>Inscription</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__row-2">
            {field('nom', 'Nom')}
            {field('prenom', 'Prénom')}
          </div>
          {field('tel', 'Téléphone', 'tel', '+229 01 xx xx xx xx')}
          {field('email', 'Email', 'email', 'john@example.com')}
          {field('nationalite', 'Nationalité', 'text', 'Béninoise')}
          <div className="auth-form__field">
            <label>Mot de Passe *</label>
            <div className="auth-form__pwd">
              <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="auth-form__error">{errors.password[0]}</span>}
          </div>
          {field('password_confirmation', 'Confirmer le mot de passe', 'password', '••••••••')}
          <button type="submit" className="btn btn--primary btn--full auth-btn" disabled={loading}>
            {loading ? 'Inscription...' : 'INSCRIPTION'}
          </button>
        </form>
        <p className="auth-card__switch">Déjà un compte ? <Link to="/connexion">Connexion</Link></p>
      </div>
    </div>
  )
}
