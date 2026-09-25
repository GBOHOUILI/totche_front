import { useState } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { passwordResetApi } from '../../api/services'
import { TYPES_COMPTE } from './MotDePasseOublie'
import toast from 'react-hot-toast'

export default function ReinitialiserMotDePasse() {
  const { type } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const conf = TYPES_COMPTE[type] || TYPES_COMPTE.user
  const Icon = conf.icon
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await passwordResetApi.reinitialiser({ type, email, token, password, password_confirmation: passwordConfirmation })
      toast.success('Mot de passe réinitialisé - vous pouvez vous reconnecter.')
      navigate(conf.loginPath)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur, réessayez.')
    } finally { setLoading(false) }
  }

  if (! email || ! token) {
    return (
      <div className="auth-page" style={conf.bg ? { background: conf.bg } : undefined}>
        <div className="auth-card">
          <div className="auth-card__icon" style={conf.bg ? { borderColor: 'var(--red)', color: 'var(--red)' } : undefined}>
            <Icon size={32} />
          </div>
          <h1>Lien invalide</h1>
          <p className="auth-card__sub">Ce lien de réinitialisation est incomplet ou a déjà été utilisé.</p>
          <p className="auth-card__switch"><Link to={`/mot-de-passe-oublie/${type}`}>Redemander un lien</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page" style={conf.bg ? { background: conf.bg } : undefined}>
      <div className="auth-card">
        <div className="auth-card__icon" style={conf.bg ? { borderColor: 'var(--red)', color: 'var(--red)' } : undefined}>
          <Icon size={32} />
        </div>
        <h1>Nouveau mot de passe</h1>
        <p className="auth-card__sub">{conf.titre}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__field">
            <label>Nouveau mot de passe *</label>
            <div className="auth-form__pwd">
              <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="auth-form__field">
            <label>Confirmer le mot de passe *</label>
            <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
              value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" className="btn btn--primary btn--full auth-btn" disabled={loading}>
            {loading ? 'Réinitialisation...' : 'RÉINITIALISER'}
          </button>
        </form>
      </div>
    </div>
  )
}
