import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// Login responsable régional : { tel, password } - compte créé par un admin,
// pas d'auto-inscription (poste officiel, même logique que l'admin).
export default function ResponsableLogin() {
  const [form, setForm] = useState({ tel: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { loginResponsable, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await loginResponsable(form)
    if (res.success) { toast.success('Bienvenue !'); navigate('/responsable') }
    else toast.error(res.message)
  }

  return (
    <div className="auth-page" style={{ background: 'var(--black)' }}>
      <div className="auth-card">
        <div className="auth-card__icon" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          <ShieldCheck size={32} />
        </div>
        <h1>Responsable Régional</h1>
        <p className="auth-card__sub">Validation territoriale des sites et événements</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__field">
            <label>Téléphone *</label>
            <input type="tel" placeholder="+229 01 xx xx xx xx"
              value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} required />
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
          <Link to="/mot-de-passe-oublie/responsable">Mot de passe oublié ?</Link>
        </p>
      </div>
    </div>
  )
}
