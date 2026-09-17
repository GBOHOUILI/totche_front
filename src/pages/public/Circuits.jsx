import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, MapPin, Calendar, Route, ChevronRight, Trash2, Save } from 'lucide-react'
import { sitesApi, evenementsApi, circuitsApi, etapesApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui/index'
import StepList from '../../components/circuit/StepList'
import CircuitMap from '../../components/map/CircuitMap'
import toast from 'react-hot-toast'

const DRAFT_KEY = 'totche_circuit_draft'
const emptyDraft = { libelle: '', description: '', etapes: [] }

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : emptyDraft
  } catch { return emptyDraft }
}

// Picker sites/événements — ajoute une étape au brouillon, ne navigue jamais
// (contrairement à SiteCard/EventCard qui sont des <Link>, inutilisables ici).
function Picker({ onAdd, alreadyAdded }) {
  const [tab, setTab] = useState('sites')
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const api = tab === 'sites' ? sitesApi : evenementsApi
    api.list({ libelle: q || undefined })
      .then(r => setResults(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [tab, q])

  return (
    <div className="circuit-picker">
      <div className="circuit-picker__tabs">
        <button type="button" className={tab === 'sites' ? 'active' : ''} onClick={() => setTab('sites')}>
          <MapPin size={14} /> Sites
        </button>
        <button type="button" className={tab === 'evenements' ? 'active' : ''} onClick={() => setTab('evenements')}>
          <Calendar size={14} /> Événements
        </button>
      </div>
      <div className="circuit-picker__search">
        <Search size={15} />
        <input placeholder={`Rechercher un ${tab === 'sites' ? 'site' : 'événement'}...`} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="circuit-picker__results">
        {loading ? (
          <div className="center-spinner"><Spinner /></div>
        ) : results.length === 0 ? (
          <p className="circuit-picker__none">Aucun résultat.</p>
        ) : results.map(item => {
          const added = alreadyAdded(tab === 'sites' ? 'site' : 'evenement', item.id)
          return (
            <button
              type="button"
              key={item.id}
              className="circuit-picker__row"
              disabled={added}
              onClick={() => onAdd(tab === 'sites' ? 'site' : 'evenement', item)}
            >
              <span>{item.libelle}</span>
              {added ? <span className="circuit-picker__added">Ajouté</span> : <Plus size={16} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Circuits() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(loadDraft)
  const [myCircuits, setMyCircuits] = useState([])
  const [loadingMine, setLoadingMine] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft])

  const loadMine = useCallback(() => {
    if (!isAuthenticated) return
    setLoadingMine(true)
    circuitsApi.list()
      .then(r => setMyCircuits(r.data?.data || r.data || []))
      .finally(() => setLoadingMine(false))
  }, [isAuthenticated])

  useEffect(() => { loadMine() }, [loadMine])

  const addStep = (type, item) => {
    setDraft(d => ({
      ...d,
      etapes: [...d.etapes, {
        id: `${type}-${item.id}`, type, refId: item.id,
        libelle: item.libelle, adresse: item.adresse,
        latitude: item.latitude, longitude: item.longitude,
      }],
    }))
  }

  const removeStep = (id) => {
    setDraft(d => ({ ...d, etapes: d.etapes.filter(e => e.id !== id) }))
  }

  const reorderSteps = (etapes) => setDraft(d => ({ ...d, etapes }))

  const alreadyAdded = (type, refId) => draft.etapes.some(e => e.type === type && e.refId === refId)

  const resetDraft = () => setDraft(emptyDraft)

  const handleSave = async () => {
    if (!draft.libelle.trim()) { toast.error('Donnez un nom à votre circuit.'); return }
    if (draft.etapes.length === 0) { toast.error('Ajoutez au moins une étape.'); return }

    if (!isAuthenticated) {
      toast('Créez votre compte pour enregistrer ce circuit — vos étapes sont conservées.', { icon: '🔒' })
      navigate('/inscription?redirect=/circuits')
      return
    }

    setSaving(true)
    try {
      const { data: circuit } = await circuitsApi.create({ libelle: draft.libelle, description: draft.description })
      for (const etape of draft.etapes) {
        await etapesApi.create(circuit.id, etape.type === 'site' ? { id_site: etape.refId } : { id_evnmt: etape.refId })
      }
      toast.success('Circuit enregistré !')
      resetDraft()
      navigate(`/circuits/${circuit.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible d'enregistrer le circuit")
    } finally {
      setSaving(false)
    }
  }

  const deleteCircuit = async (id) => {
    if (!confirm('Supprimer ce circuit ? Vos réservations liées ne seront pas affectées.')) return
    try {
      await circuitsApi.delete(id)
      toast.success('Circuit supprimé')
      loadMine()
    } catch {
      toast.error('Suppression impossible')
    }
  }

  const mapEtapes = draft.etapes.map((e, i) => ({ ...e, ordre: i + 1 }))

  return (
    <div className="page-circuits">
      <div className="page-hero page-hero--sm">
        <h1>Composez votre circuit</h1>
        <p>Choisissez vos sites et événements, organisez votre itinéraire dans l'ordre qui vous convient, et visualisez-le sur la carte.</p>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        {isAuthenticated && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 className="circuit-section-title">Mes circuits</h2>
            {loadingMine ? (
              <div className="center-spinner"><Spinner /></div>
            ) : myCircuits.length === 0 ? (
              <p className="step-list__empty">Vous n'avez pas encore de circuit enregistré — construisez-en un ci-dessous.</p>
            ) : (
              <div className="circuit-list">
                {myCircuits.map(c => (
                  <div key={c.id} className="circuit-list__item">
                    <Link to={`/circuits/${c.id}`} className="circuit-list__link">
                      <Route size={18} />
                      <div>
                        <strong>{c.libelle}</strong>
                        <span>{c.etapes?.length || 0} étape{(c.etapes?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                      <ChevronRight size={16} />
                    </Link>
                    <button className="circuit-list__delete" onClick={() => deleteCircuit(c.id)} aria-label="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="circuit-section-title">Nouveau circuit</h2>
          {!isAuthenticated && (
            <p className="circuit-banner">
              Vous pouvez construire votre circuit librement — un compte est seulement nécessaire pour l'enregistrer.
            </p>
          )}

          <div className="circuit-builder__form">
            <input
              type="text"
              placeholder="Nom du circuit (ex. Week-end à Ouidah)"
              value={draft.libelle}
              onChange={e => setDraft(d => ({ ...d, libelle: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="circuit-builder">
            <div className="circuit-builder__col">
              <Picker onAdd={addStep} alreadyAdded={alreadyAdded} />
            </div>
            <div className="circuit-builder__col">
              <h3 className="circuit-subtitle">Étapes ({draft.etapes.length})</h3>
              <StepList steps={draft.etapes} onReorder={reorderSteps} onRemove={removeStep} />
              <CircuitMap etapes={mapEtapes} height={280} />
              <button className="btn btn--primary btn--full" style={{ marginTop: '1.25rem' }} onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer le circuit'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
