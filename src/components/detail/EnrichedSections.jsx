import { Check, X } from 'lucide-react'

// Chantier 2 (fiches détail enrichies) : blocs identiques sur les 5 entités
// (Site/Evenement/Hotel/Restaurant/Transport), n'affichés que si le champ
// correspondant est renseigné en base - jamais de section vide.

export function HighlightsSection({ points }) {
  if (!points?.length) return null
  return (
    <section className="detail-section">
      <h2>Moments forts</h2>
      <ul className="detail-highlights">
        {points.map((p, i) => (
          <li key={i}><Check size={16} />{p}</li>
        ))}
      </ul>
    </section>
  )
}

export function ItinerarySection({ steps }) {
  if (!steps?.length) return null
  return (
    <section className="detail-section">
      <h2>Programme détaillé</h2>
      <ol className="detail-itinerary">
        {steps.map((s, i) => (
          <li key={i} className="detail-itinerary__step">
            <span className="detail-itinerary__num">{i + 1}</span>
            <div>
              <strong>{s.titre}</strong>
              <p>{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function IncludedSection({ inclus, nonInclus, inclusLabel = 'Services inclus' }) {
  if (!inclus?.length && !nonInclus?.length) return null
  return (
    <section className="detail-section">
      <div className="detail-included">
        {inclus?.length > 0 && (
          <div className="detail-included__col">
            <h3>{inclusLabel}</h3>
            <ul>{inclus.map((v, i) => <li key={i}><Check size={14} />{v}</li>)}</ul>
          </div>
        )}
        {nonInclus?.length > 0 && (
          <div className="detail-included__col detail-included__col--neg">
            <h3>À prévoir</h3>
            <ul>{nonInclus.map((v, i) => <li key={i}><X size={14} />{v}</li>)}</ul>
          </div>
        )}
      </div>
    </section>
  )
}

export function PracticalInfoSection({ infosPratiques, recommandations }) {
  if (!infosPratiques && !recommandations) return null
  return (
    <section className="detail-section">
      <h2>Informations pratiques</h2>
      {infosPratiques && <p className="detail-description">{infosPratiques}</p>}
      {recommandations && (
        <p className="detail-description" style={{ marginTop: infosPratiques ? '0.75rem' : 0 }}>
          <strong>Recommandation — </strong>{recommandations}
        </p>
      )}
    </section>
  )
}

export function FactsCard({ facts }) {
  const items = facts.filter(f => f.value)
  if (!items.length) return null
  return (
    <div className="detail-card">
      <h3>Fiche technique</h3>
      <div className="detail-facts">
        {items.map((f, i) => (
          <div key={i} className="detail-facts__item">
            <f.icon size={16} />
            <div>
              <strong>{f.label}</strong>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
