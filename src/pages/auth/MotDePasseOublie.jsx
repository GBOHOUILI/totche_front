import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Shield, ShieldCheck, Briefcase, User } from 'lucide-react'
import { passwordResetApi } from '../../api/services'
import toast from 'react-hot-toast'

// Commun aux 4 types de comptes - seul le recouvrement se fait par email
// pour tous (cf. PasswordResetController), la connexion elle-même reste
// inchangée (tel pour admin/responsable).
export const TYPES_COMPTE = {
  user: { icon: User, titre: 'Connexion', loginPath: '/connexion', bg: null },
  admin: { icon: Shield, titre: 'Administration', loginPath: '/admin/login', bg: 'var(--black)' },
  prestataire: { icon: Briefcase, titre: 'Espace Prestataire', loginPath: '/prestataire/login', bg: null },
  responsable: { icon: ShieldCheck, titre: 'Responsable Régional', loginPath: '/responsable/login', bg: 'var(--black)' },
}

export default function MotDePasseOublie() {
  const { type } = useParams()
  const conf = TYPES_COMPTE[type] || TYPES_COMPTE.user
  const Icon = conf.icon
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await passwordResetApi.demander(type, email)
      setEnvoye(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur, réessayez.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page" style={conf.bg ? { background: conf.bg } : undefined}>
      <div className="auth-card">
        <div className="auth-card__icon" style={conf.bg ? { borderColor: 'var(--red)', color: 'var(--red)' } : undefined}>
          <Icon size={32} />
        </div>
        <h1>Mot de passe oublié</h1>
        <p className="auth-card__sub">{conf.titre}</p>

        {envoye ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-700)', fontSize: '0.9rem', margin: '1rem 0' }}>
            Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé. Vérifiez votre boîte de réception.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form__field">
              <label>Email *</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn--primary btn--full auth-btn" disabled={loading}>
              {loading ? 'Envoi...' : 'ENVOYER LE LIEN'}
            </button>
          </form>
        )}

        <p className="auth-card__switch">
          <Link to={conf.loginPath}>Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
