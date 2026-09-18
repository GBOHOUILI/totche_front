import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ─── À PROPOS ────────────────────────────────────────────
export function APropos() {
  const values = [
    { title: 'Notre Mission', text: 'Centraliser et promouvoir les sites touristiques et événements culturels du Bénin à travers une plateforme numérique moderne, accessible et intuitive.' },
    { title: 'Notre Vision', text: 'Faire du Bénin une destination touristique incontournable en Afrique de l\'Ouest grâce à la technologie et à la valorisation de son patrimoine unique.' },
    { title: 'Nos Valeurs', text: 'Authenticité, innovation, accessibilité et engagement envers la promotion de la culture et du patrimoine béninois.' },
  ]

  const team = [
    { name: 'Justin Bénin', role: 'Fondateur & Développeur', initials: 'JB' },
    { name: 'Sen Impact', role: 'Technologies', initials: 'SI' },
  ]

  return (
    <div className="page-apropos">
      <div className="page-hero">
        <h1>À propos de Totché</h1>
        <p>La plateforme qui valorise le patrimoine touristique et culturel du Bénin</p>
      </div>

      <div className="container">
        {/* Intro */}
        <section className="apropos-section">
          <div className="apropos-intro">
            <div className="apropos-intro__text">
              <h2>Qui sommes-nous ?</h2>
              <p>
                Le Bénin est un pays riche d'un patrimoine historique, culturel et naturel exceptionnel.
                Cependant, malgré cet important potentiel, le secteur du tourisme reste peu développé
                et largement sous-exploité. <strong>Totché</strong> est née pour changer cela.
              </p>
              <p>
                Notre plateforme centralise et promeut les sites touristiques et événements culturels
                du Bénin, offrant aux visiteurs locaux et internationaux un outil numérique complet
                pour explorer, réserver et vivre le Bénin autrement.
              </p>
            </div>
            <div className="apropos-intro__img">
              <img src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80" alt="Bénin" />
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="apropos-section">
          <h2 className="apropos-section__title">Nos Valeurs</h2>
          <div className="apropos-values">
            {values.map(v => (
              <div key={v.title} className="apropos-value-card">
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="apropos-section">
          <h2 className="apropos-section__title">L'Équipe</h2>
          <div className="apropos-team">
            {team.map(m => (
              <div key={m.name} className="apropos-team-card">
                <div className="apropos-team-card__avatar">{m.initials}</div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// ─── CONTACT ─────────────────────────────────────────────
export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    // Simulated send - wire to your backend endpoint if needed
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Message envoyé ! Nous vous répondrons dans les plus brefs délais.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  const contacts = [
    { icon: Phone, label: 'Téléphone', value: '+229 01 67 75 88 20' },
    { icon: Mail, label: 'Email', value: 'ajustinsena@gmail.com' },
    { icon: MapPin, label: 'Adresse', value: 'Cotonou, Bénin' },
  ]

  return (
    <div className="page-contact">
      <div className="page-hero page-hero--sm">
        <h1>Contactez-nous</h1>
        <p>Une question ? Une suggestion ? Nous sommes à votre écoute.</p>
      </div>

      <div className="container">
        <div className="contact-layout">
          {/* Info */}
          <div className="contact-info">
            <h2>Nos coordonnées</h2>
            <p>N'hésitez pas à nous contacter pour toute question concernant la plateforme, un partenariat ou une collaboration.</p>
            <div className="contact-cards">
              {contacts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="contact-card">
                  <div className="contact-card__icon"><Icon size={20} /></div>
                  <div>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            <h2>Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="admin-form contact-form">
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Nom complet *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="admin-form__field">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>
              <div className="admin-form__field">
                <label>Sujet *</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="admin-form__field">
                <label>Message *</label>
                <textarea rows={6} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn--primary" disabled={sending}>
                <Send size={16} /> {sending ? 'Envoi...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
