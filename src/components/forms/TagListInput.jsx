import { Plus, X } from 'lucide-react'

// value: string[] - onChange(string[]). Réutilisé pour points_forts,
// inclus, non_inclus sur les 5 entités (Site/Evenement/Hotel/Restaurant/
// Transport) - même composant partout, seul le label change par appelant.
export default function TagListInput({ label, value = [], onChange, placeholder }) {
  const update = (i, val) => {
    const next = [...value]
    next[i] = val
    onChange(next)
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, ''])

  return (
    <div className="admin-form__field tag-list-input">
      <label>{label}</label>
      {value.map((v, i) => (
        <div key={i} className="tag-list-input__row">
          <input
            type="text"
            value={v ?? ''}
            onChange={e => update(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder={placeholder}
          />
          <button type="button" className="tag-list-input__remove" aria-label="Supprimer" onClick={() => remove(i)}>
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="tag-list-input__add" onClick={add}>
        <Plus size={14} /> Ajouter
      </button>
    </div>
  )
}
