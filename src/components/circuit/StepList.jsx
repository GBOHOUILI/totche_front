import { useState } from 'react'
import { GripVertical, ChevronUp, ChevronDown, MapPin, Calendar, Trash2, CheckCircle2 } from 'lucide-react'

// Liste réordonnable des étapes d'un circuit - deux façons équivalentes de
// réordonner (l'utilisateur a demandé les deux) : glisser-déposer (souris) et
// flèches haut/bas (clavier/tactile, toujours visibles). Les deux aboutissent au
// même callback onReorder(steps) avec le tableau complet dans le nouvel ordre -
// à l'appelant de traduire ça en état local (brouillon) ou en appel API
// (circuitsApi.reordonner attend justement une liste d'ids dans l'ordre voulu).
export default function StepList({ steps, onReorder, onRemove, renderTrailing }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const move = (from, to) => {
    if (to < 0 || to >= steps.length || from === to) return
    const next = [...steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  const handleDrop = (index) => {
    if (dragIndex === null) return
    move(dragIndex, index)
    setDragIndex(null)
    setOverIndex(null)
  }

  if (steps.length === 0) {
    return <p className="step-list__empty">Aucune étape pour l'instant - ajoutez un site ou un événement ci-dessus.</p>
  }

  return (
    <ol className="step-list">
      {steps.map((step, i) => (
        <li
          key={step.id}
          className={`step-list__item${overIndex === i ? ' step-list__item--over' : ''}`}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
          onDragLeave={() => setOverIndex(o => (o === i ? null : o))}
          onDrop={() => handleDrop(i)}
          onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
        >
          <span className="step-list__handle" title="Glisser pour réordonner"><GripVertical size={16} /></span>
          <span className="step-list__num">{i + 1}</span>
          <span className="step-list__icon">
            {step.type === 'evenement' ? <Calendar size={16} /> : <MapPin size={16} />}
          </span>
          <div className="step-list__info">
            <strong>{step.libelle}</strong>
            {step.adresse && <span>{step.adresse}</span>}
          </div>
          {step.reservee && (
            <span className="step-list__reserved" title="Une réservation est liée à cette étape">
              <CheckCircle2 size={15} /> Réservée
            </span>
          )}
          {renderTrailing?.(step)}
          <div className="step-list__actions">
            <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(i, i - 1)}>
              <ChevronUp size={15} />
            </button>
            <button type="button" aria-label="Descendre" disabled={i === steps.length - 1} onClick={() => move(i, i + 1)}>
              <ChevronDown size={15} />
            </button>
            <button type="button" aria-label="Retirer" className="step-list__remove" onClick={() => onRemove(step.id)}>
              <Trash2 size={15} />
            </button>
          </div>
        </li>
      ))}
    </ol>
  )
}
