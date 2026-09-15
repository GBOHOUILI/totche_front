import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// Login admin : { tel, password }
export default function AdminLogin() {
  const [form, setForm] = useState({ tel: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { loginAdmin, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await loginAdmin(form)
    if (res.success) { toast.success('Bienvenue admin !'); navigate('/admin') }
    else toast.error(res.message)
  }

  return (
    <div className="auth-page" style={{ background: '#0D0D0D' }}>
      <div className="auth-card">
        <div className="auth-card__icon" style={{ borderColor: '#E63946', color: '#E63946' }}>
          <Shield size={32} />
        </div>
        <h1>Administration</h1>
        <p className="auth-card__sub">Espace réservé aux administrateurs</p>
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
      </div>
    </div>
  )
}
