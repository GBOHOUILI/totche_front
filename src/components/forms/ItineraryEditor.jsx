import { Plus, X } from 'lucide-react'

// value: {titre, description}[] - onChange(entries). Utilisé uniquement
// pour Evenement.itineraire (programme jour par jour) - pas d'équivalent
// sur les 4 autres entités.
//
// Comme pour TagListInput, filtrer les étapes incomplètes (titre ou
// description vide) avant soumission est la responsabilité du formulaire
// appelant - EvenementController valide itineraire.*.titre/description en
// required_with:itineraire, une étape vide ajoutée puis abandonnée
// provoquerait un 422 si elle n'est pas filtrée avant l'envoi.
export default function ItineraryEditor({ value = [], onChange, label = 'Itinéraire (programme jour par jour)' }) {
  const update = (i, field, val) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, { titre: '', description: '' }])

  return (
    <div className="admin-form__field itinerary-editor">
      <label>{label}</label>
      {value.map((step, i) => (
        <div key={i} className="itinerary-editor__step">
          <div className="itinerary-editor__step-header">
            <span>Étape {i + 1}</span>
            <button type="button" className="tag-list-input__remove" aria-label="Supprimer" onClick={() => remove(i)}>
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            value={step.titre ?? ''}
            onChange={e => update(i, 'titre', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault() } }}
            placeholder="Titre (ex: Jour 1 - Arrivée à Ouidah)"
          />
          <textarea
            rows={2}
            value={step.description ?? ''}
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
