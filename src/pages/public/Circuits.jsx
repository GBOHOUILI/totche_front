import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, MapPin, Calendar, Route, ChevronRight, Trash2, Save, Sparkles } from 'lucide-react'
import { sitesApi, evenementsApi, circuitsApi, etapesApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui/index'
import StepList from '../../components/circuit/StepList'
import CircuitMap from '../../components/map/CircuitMap'
import toast from 'react-hot-toast'

const INTERETS_DISPONIBLES = ['Culture', 'Nature', 'Plage', 'Gastronomie', 'Artisanat', 'Aventure']
const JOURS_RAPIDES = [1, 2, 3, 5, 7, 10]
const BUDGETS_RAPIDES = [25000, 50000, 100000, 200000]

// Appel de génération partagé par les 3 modes (conversation/curseurs/cartes -
// mêmes 3 variantes que le prototype web.html) : même contrat API, seule
// l'interface de saisie des contraintes change. Ne persiste rien - le
// résultat remplace simplement le brouillon existant (onGenerated).
async function genererCircuit(contraintes) {
  const { data } = await circuitsApi.genererIA(contraintes)
  return data
}

function notifierResultat(data) {
  const budgetLine = data.budget_estime
    ? ` · budget estimé ${Number(data.budget_estime).toLocaleString('fr-FR')} FCFA`
    : ''
  toast.success(`Circuit proposé : « ${data.titre} »${budgetLine}`)
}

function ToggleUnique({ options, value, onChange }) {
  return (
    <div className="filters__cats">
      {options.map(([val, label]) => (
        <button type="button" key={val} className={`filters__cat${value === val ? ' filters__cat--active' : ''}`} onClick={() => onChange(val)}>
          {label}
        </button>
      ))}
    </div>
  )
}

function InteretsChips({ value, onChange }) {
  const toggle = (i) => onChange(value.includes(i) ? value.filter(x => x !== i) : [...value, i])
  return (
    <div className="filters__cats">
      {INTERETS_DISPONIBLES.map(i => (
        <button type="button" key={i} className={`filters__cat${value.includes(i) ? ' filters__cat--active' : ''}`} onClick={() => toggle(i)}>
          {i}
        </button>
      ))}
    </div>
  )
}

// ── Mode "Curseurs" ──────────────────────────────────────────────────────
function AiSliders({ onGenerated }) {
  const [jours, setJours] = useState(3)
  const [budget, setBudget] = useState(75000)
  const [saison, setSaison] = useState('sec')
  const [interets, setInterets] = useState([])
  const [loading, setLoading] = useState(false)

  const generer = async () => {
    setLoading(true)
    try {
      const data = await genererCircuit({ jours, budget, saison, interets })
      onGenerated(data)
      notifierResultat(data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de générer un circuit pour l'instant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="ai-wizard__slider">
        <label>Séjour de <strong>{jours} jour{jours > 1 ? 's' : ''}</strong></label>
        <input type="range" min={1} max={14} value={jours} onChange={e => setJours(Number(e.target.value))} />
      </div>
      <div className="ai-wizard__slider">
        <label>Budget total : <strong>{Number(budget).toLocaleString('fr-FR')} FCFA</strong></label>
        <input type="range" min={0} max={300000} step={5000} value={budget} onChange={e => setBudget(Number(e.target.value))} />
      </div>
      <div className="ai-wizard__field">
        <label>Période</label>
        <ToggleUnique options={[['sec', 'Saison sèche'], ['pluie', 'Saison des pluies']]} value={saison} onChange={setSaison} />
      </div>
      <div className="ai-wizard__field">
        <label>Centres d'intérêt</label>
        <InteretsChips value={interets} onChange={setInterets} />
      </div>
      <button className="btn btn--primary" onClick={generer} disabled={loading}>
        <Sparkles size={16} /> {loading ? 'Génération en cours...' : 'Générer mon circuit'}
      </button>
    </div>
  )
}

// ── Mode "Conversation" ──────────────────────────────────────────────────
// Questions à choix rapides (pas de texte libre) : garde une génération
// fiable sans dépendre d'une analyse de langage sur la conversation
// elle-même - seule l'étape finale interroge réellement le modèle.
function AiChat({ onGenerated }) {
  const [reponses, setReponses] = useState({ jours: null, budget: null, saison: null, interets: [] })
  const [etape, setEtape] = useState(0)
  const [loading, setLoading] = useState(false)

  const repondreEtSuivre = (cle, valeur) => {
    setReponses(r => ({ ...r, [cle]: valeur }))
    setEtape(e => e + 1)
  }

  const generer = async () => {
    setLoading(true)
    try {
      const data = await genererCircuit(reponses)
      onGenerated(data)
      notifierResultat(data)
      setEtape(0)
      setReponses({ jours: null, budget: null, saison: null, interets: [] })
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de générer un circuit pour l'instant")
    } finally {
      setLoading(false)
    }
  }

  const historique = []
  if (reponses.jours) historique.push({ q: 'Combien de jours dure votre séjour ?', a: `${reponses.jours} jour${reponses.jours > 1 ? 's' : ''}` })
  if (etape > 1) historique.push({ q: 'Quel est votre budget total ?', a: reponses.budget ? `${Number(reponses.budget).toLocaleString('fr-FR')} FCFA` : 'Pas de limite précise' })
  if (reponses.saison) historique.push({ q: "Quelle période de l'année ?", a: reponses.saison === 'sec' ? 'Saison sèche' : 'Saison des pluies' })
  if (etape > 3) historique.push({ q: "Qu'est-ce qui vous intéresse ?", a: reponses.interets.length ? reponses.interets.join(', ') : 'Surprenez-moi' })

  return (
    <div className="ai-chat">
      {historique.map((m, i) => (
        <div key={i} className="ai-chat__exchange">
          <div className="ai-chat__bubble ai-chat__bubble--bot">{m.q}</div>
          <div className="ai-chat__bubble ai-chat__bubble--user">{m.a}</div>
        </div>
      ))}

      {etape === 0 && (
        <div className="ai-chat__step">
          <div className="ai-chat__bubble ai-chat__bubble--bot">Combien de jours dure votre séjour ?</div>
          <div className="filters__cats">
            {JOURS_RAPIDES.map(j => (
              <button type="button" key={j} className="filters__cat" onClick={() => repondreEtSuivre('jours', j)}>{j} jour{j > 1 ? 's' : ''}</button>
            ))}
          </div>
        </div>
      )}

      {etape === 1 && (
        <div className="ai-chat__step">
          <div className="ai-chat__bubble ai-chat__bubble--bot">Quel est votre budget total (FCFA) ?</div>
          <div className="filters__cats">
            {BUDGETS_RAPIDES.map(b => (
              <button type="button" key={b} className="filters__cat" onClick={() => repondreEtSuivre('budget', b)}>{b.toLocaleString('fr-FR')} FCFA</button>
            ))}
            <button type="button" className="filters__cat" onClick={() => repondreEtSuivre('budget', null)}>Pas de limite précise</button>
          </div>
        </div>
      )}

      {etape === 2 && (
        <div className="ai-chat__step">
          <div className="ai-chat__bubble ai-chat__bubble--bot">Quelle période de l'année ?</div>
          <div className="filters__cats">
            <button type="button" className="filters__cat" onClick={() => repondreEtSuivre('saison', 'sec')}>Saison sèche</button>
            <button type="button" className="filters__cat" onClick={() => repondreEtSuivre('saison', 'pluie')}>Saison des pluies</button>
          </div>
        </div>
      )}

      {etape === 3 && (
        <div className="ai-chat__step">
          <div className="ai-chat__bubble ai-chat__bubble--bot">Qu'est-ce qui vous intéresse ? (plusieurs choix possibles)</div>
          <InteretsChips value={reponses.interets} onChange={v => setReponses(r => ({ ...r, interets: v }))} />
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: '0.75rem' }} onClick={() => setEtape(4)}>Continuer</button>
        </div>
      )}

      {etape >= 4 && (
        <div className="ai-chat__step">
          <div className="ai-chat__bubble ai-chat__bubble--bot">Parfait, je vous prépare un circuit sur mesure !</div>
          <button className="btn btn--primary" onClick={generer} disabled={loading}>
            <Sparkles size={16} /> {loading ? 'Génération en cours...' : 'Générer mon circuit'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Mode "Cartes à trier" ────────────────────────────────────────────────
// Pas de nouvelle mécanique de swipe : le tri par glisser-déposer/flèches
// existe déjà (StepList, section "Nouveau circuit" ci-dessous) - ce mode
// y renvoie directement plutôt que de dupliquer la fonctionnalité.
function AiCartes() {
  return (
    <div className="ai-chat__step">
      <p style={{ color: 'var(--gray-700)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Choisissez vos sites et événements librement, puis triez vos étapes par glisser-déposer
        ou avec les flèches - directement dans la composition manuelle juste en dessous.
      </p>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => document.getElementById('circuit-manuel')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Aller à la composition manuelle <ChevronRight size={16} />
      </button>
    </div>
  )
}

const MODES_IA = [
  ['conversation', 'Conversation'],
  ['curseurs', 'Curseurs'],
  ['cartes', 'Cartes à trier'],
]

function AiSection({ onGenerated }) {
  const [mode, setMode] = useState('conversation')

  return (
    <div className="ai-wizard">
      <div className="ai-wizard__header">
        <Sparkles size={18} />
        <div>
          <h3>Composer avec l'IA</h3>
          <p>Trois façons d'exprimer vos envies, la même IA derrière - choisissez celle qui vous convient.</p>
        </div>
      </div>

      <div className="ai-wizard__tabs">
        {MODES_IA.map(([val, label]) => (
          <button
            type="button"
            key={val}
            className={`ai-wizard__tab${mode === val ? ' ai-wizard__tab--active' : ''}`}
            onClick={() => setMode(val)}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'conversation' && <AiChat onGenerated={onGenerated} />}
      {mode === 'curseurs' && <AiSliders onGenerated={onGenerated} />}
      {mode === 'cartes' && <AiCartes />}
    </div>
  )
}

const DRAFT_KEY = 'totche_circuit_draft'
const emptyDraft = { libelle: '', description: '', etapes: [] }

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : emptyDraft
  } catch { return emptyDraft }
}

// Picker sites/événements - ajoute une étape au brouillon, ne navigue jamais
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

  // Remplace le brouillon par la proposition de l'IA - prévient d'abord si des
  // étapes manuelles existent déjà, pour ne jamais les écraser silencieusement.
  const applyAiProposal = (proposal) => {
    if (draft.etapes.length > 0 && !confirm('Remplacer les étapes actuelles par la proposition de l\'IA ?')) return
    setDraft(d => ({
      libelle: d.libelle.trim() || proposal.titre || d.libelle,
      description: d.description,
      etapes: proposal.etapes.map(e => ({
        id: `${e.type}-${e.item.id}`, type: e.type, refId: e.item.id,
        libelle: e.item.libelle, adresse: e.item.adresse,
        latitude: e.item.latitude, longitude: e.item.longitude,
      })),
    }))
  }

  const handleSave = async () => {
    if (!draft.libelle.trim()) { toast.error('Donnez un nom à votre circuit.'); return }
    if (draft.etapes.length === 0) { toast.error('Ajoutez au moins une étape.'); return }

    if (!isAuthenticated) {
      toast('Créez votre compte pour enregistrer ce circuit - vos étapes sont conservées.', { icon: '🔒' })
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
      <div className="page-hero page-hero--sm" style={{ backgroundImage: "url('https://commons.wikimedia.org/wiki/Special:FilePath/Pirogue%20%C3%A0%20voile%20ou%20pirogue%20%C3%A0%20balancier%20de%20type%20b%C3%A9ninois%20sur%20le%20fleuve%20de%20Ganvi%C3%A9%2005.jpg?width=1600')" }}>
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
              <p className="step-list__empty">Vous n'avez pas encore de circuit enregistré - construisez-en un ci-dessous.</p>
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

        <section style={{ marginBottom: '2.5rem' }}>
          <AiSection onGenerated={applyAiProposal} />
        </section>

        <section id="circuit-manuel">
          <h2 className="circuit-section-title">Nouveau circuit</h2>
          {!isAuthenticated && (
            <p className="circuit-banner">
              Vous pouvez construire votre circuit librement - un compte est seulement nécessaire pour l'enregistrer.
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
