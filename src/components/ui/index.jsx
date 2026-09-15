import { Star } from 'lucide-react'
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
export function SiteCard({ site, index = 0 }) {
  const cover = site.galeries?.[0]?.url_fichier || site.galeries?.[0]?.url
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
        {site.categorie && (
          <span className="card__cat">{site.categorie.libelle}</span>
        )}
      </div>
      <div className="card__body">
        <h3 className="card__title">{site.libelle}</h3>
        <p className="card__location">
          {site.adresse}
          {typeof site.distance_km === 'number' && ` · ${site.distance_km.toFixed(1)} km`}
        </p>
        <Stars value={site.moyenne_avis || 0} />
      </div>
    </Link>
  )
}

// ─── Event Card ──────────────────────────────────────────
export function EventCard({ event, index = 0 }) {
  const cover = event.galeries?.[0]?.url_fichier || event.galeries?.[0]?.url
  const dateDebut = event.date_debut ? new Date(event.date_debut) : null
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
        {event.categorie && (
          <span className="card__cat">{event.categorie.libelle}</span>
        )}
      </div>
      <div className="card__body">
        <h3 className="card__title">{event.libelle}</h3>
        <p className="card__location">
          {event.adresse}
          {typeof event.distance_km === 'number' && ` · ${event.distance_km.toFixed(1)} km`}
        </p>
        {dateDebut && (
          <p className="card__date">
            {dateDebut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        <Stars value={event.moyenne_avis || 0} />
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
