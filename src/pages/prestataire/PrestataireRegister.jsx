import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const TYPES = [
  { value: 'hotel', label: 'Hôtel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'transport', label: 'Transport' },
  { value: 'site', label: 'Site touristique' },
  { value: 'evenement', label: "Organisateur d'événements" },
]

// Champs backend : nom_entreprise, type_prestataire, email, tel, password, password_confirmation
export default function PrestataireRegister() {
  const [form, setForm] = useState({ nom_entreprise: '', type_prestataire: '', email: '', tel: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [acceptCgu, setAcceptCgu] = useState(false)
  const { registerPrestataire, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!acceptCgu) { toast.error('Merci d\'accepter les conditions d\'utilisation et la politique de confidentialité'); return }
    const res = await registerPrestataire(form)
    if (res.success) { toast.success('Compte prestataire créé !'); navigate('/prestataire') }
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
        <div className="auth-card__icon"><Briefcase size={32} /></div>
        <h1>Devenir Prestataire</h1>
        <p className="auth-card__sub">Publiez et gérez vos hôtels, restaurants, transports, sites ou événements</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {field('nom_entreprise', "Nom de l'entreprise")}
          <div className="auth-form__field">
            <label>Type d'activité *</label>
            <select value={form.type_prestataire} onChange={e => setForm(f => ({ ...f, type_prestataire: e.target.value }))} required>
              <option value="">Sélectionner...</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.type_prestataire && <span className="auth-form__error">{errors.type_prestataire[0]}</span>}
          </div>
          {field('email', 'Email', 'email', 'contact@monentreprise.com')}
          {field('tel', 'Téléphone', 'tel', '+229 01 xx xx xx xx')}
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
          <div className="auth-form__field">
            <label>Confirmer le mot de passe *</label>
            <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
              value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} required />
          </div>
          <label className="auth-form__checkbox">
            <input type="checkbox" checked={acceptCgu} onChange={e => setAcceptCgu(e.target.checked)} required />
            <span>
              J'accepte les <Link to="/conditions-utilisation" target="_blank">conditions d'utilisation</Link>{' '}
              et la <Link to="/politique-de-confidentialite" target="_blank">politique de confidentialité</Link>
            </span>
          </label>
          <button type="submit" className="btn btn--primary btn--full auth-btn" disabled={loading}>
            {loading ? 'Création...' : 'CRÉER MON COMPTE'}
          </button>
        </form>
        <p className="auth-card__switch">Déjà un compte ? <Link to="/prestataire/login">Connexion</Link></p>
      </div>
    </div>
  )
}
