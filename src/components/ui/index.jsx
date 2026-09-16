import { Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Stars ───────────────────────────────────────────────
export function Stars({ value = 0, max = 5, size = 14 }) {
  return (
    <div className="stars">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(value) ? 'currentColor' : 'none'}
          className={i < Math.round(value) ? 'star--filled' : 'star--empty'}
        />
      ))}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}

// ─── Spinner ─────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  return <div className={`spinner spinner--${size}`} />
}

// ─── Site Card ───────────────────────────────────────────
// Pattern "liste éditoriale" (armenia.travel / visitpa.com) : image plate
// sans cadre, légende sous l'image (jamais dessus), lien texte en CTA.
export function SiteCard({ site, index = 0 }) {
  const cover = site.galeries?.[0]?.url_fichier || site.galeries?.[0]?.url
  const locLine = [site.adresse, typeof site.distance_km === 'number' ? `${site.distance_km.toFixed(1)} km` : null].filter(Boolean).join(' · ')
  return (
    <Link
      to={`/sites/${site.id}`}
      className="card card--site"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card__img-wrap">
        {cover
          ? <img src={cover} alt={site.libelle} loading="lazy" />
          : <div className="card__img-placeholder" />
        }
      </div>
      <div className="card__body">
        {site.categorie && <p className="card__eyebrow">{site.categorie.libelle}</p>}
        <h3 className="card__title">{site.libelle}</h3>
        {locLine && <p className="card__location">{locLine}</p>}
        {site.description && <p className="card__desc">{site.description}</p>}
        <span className="card__link">Découvrir <ArrowRight size={13} /></span>
      </div>
    </Link>
  )
}

// ─── Event Card ──────────────────────────────────────────
export function EventCard({ event, index = 0 }) {
  const cover = event.galeries?.[0]?.url_fichier || event.galeries?.[0]?.url
  const dateDebut = event.date_debut ? new Date(event.date_debut) : null
  const locLine = [event.adresse, typeof event.distance_km === 'number' ? `${event.distance_km.toFixed(1)} km` : null].filter(Boolean).join(' · ')
  return (
    <Link
      to={`/evenements/${event.id}`}
      className="card card--event"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card__img-wrap">
        {cover
          ? <img src={cover} alt={event.libelle} loading="lazy" />
          : <div className="card__img-placeholder card__img-placeholder--event" />
        }
      </div>
      <div className="card__body">
        <p className="card__eyebrow">
          {event.categorie?.libelle}
          {event.categorie && dateDebut && ' · '}
          {dateDebut && dateDebut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <h3 className="card__title">{event.libelle}</h3>
        {locLine && <p className="card__location">{locLine}</p>}
        {event.description && <p className="card__desc">{event.description}</p>}
        <span className="card__link">Découvrir <ArrowRight size={13} /></span>
      </div>
    </Link>
  )
}

// ─── Empty State ─────────────────────────────────────────
export function EmptyState({ message = 'Aucun résultat trouvé', icon: Icon }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} strokeWidth={1} />}
      <p>{message}</p>
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  )
}
