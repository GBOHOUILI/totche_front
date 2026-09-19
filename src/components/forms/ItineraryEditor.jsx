import { Plus, X } from 'lucide-react'

// value: {titre, description}[] - onChange(entries). Utilisé uniquement
// pour Evenement.itineraire (programme jour par jour) - pas d'équivalent
// sur les 4 autres entités.
export default function ItineraryEditor({ value = [], onChange }) {
  const update = (i, field, val) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, { titre: '', description: '' }])

  return (
    <div className="admin-form__field itinerary-editor">
      <label>Itinéraire (programme jour par jour)</label>
      {value.map((step, i) => (
        <div key={i} className="itinerary-editor__step">
          <div className="itinerary-editor__step-header">
            <span>Étape {i + 1}</span>
            <button type="button" className="tag-list-input__remove" onClick={() => remove(i)}>
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            value={step.titre}
            onChange={e => update(i, 'titre', e.target.value)}
            placeholder="Titre (ex: Jour 1 - Arrivée à Ouidah)"
          />
          <textarea
            rows={2}
            value={step.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Description de l'étape"
          />
        </div>
      ))}
      <button type="button" className="tag-list-input__add" onClick={add}>
        <Plus size={14} /> Ajouter une étape
      </button>
    </div>
  )
}
