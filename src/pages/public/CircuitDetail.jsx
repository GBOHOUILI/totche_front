import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import { circuitsApi, etapesApi, reservationsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import StepList from '../../components/circuit/StepList'
import CircuitMap from '../../components/map/CircuitMap'
import toast from 'react-hot-toast'

// Étape brute (API) -> forme attendue par <StepList>/<CircuitMap>.
function toStep(etape) {
  const cible = etape.site || etape.evenement
  return {
    id: etape.id,
    ordre: etape.ordre,
    type: etape.id_site ? 'site' : 'evenement',
    libelle: cible?.libelle || '—',
    adresse: cible?.adresse,
    latitude: cible?.latitude,
    longitude: cible?.longitude,
    reservee: !!etape.reservation,
    idSite: etape.id_site,
    idEvnmt: etape.id_evnmt,
  }
}

export default function CircuitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [circuit, setCircuit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ libelle: '', description: '' })
  const [mesReservations, setMesReservations] = useState([])

  const load = useCallback(() => {
    setLoading(true)
    circuitsApi.get(id)
      .then(r => {
        setCircuit(r.data)
        setForm({ libelle: r.data.libelle, description: r.data.description || '' })
      })
      .catch(err => {
        toast.error(err.response?.status === 403 ? "Ce circuit ne vous appartient pas." : 'Circuit introuvable.')
        navigate('/circuits')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    reservationsApi.list().then(r => setMesReservations(r.data?.data || r.data || [])).catch(() => {})
  }, [])

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>
  if (!circuit) return null

  const steps = (circuit.etapes || []).slice().sort((a, b) => a.ordre - b.ordre).map(toStep)

  const saveInfo = async (e) => {
    e.preventDefault()
    try {
      const { data } = await circuitsApi.update(id, form)
      setCircuit(c => ({ ...c, ...data }))
      setEditing(false)
      toast.success('Circuit mis à jour')
    } catch {
      toast.error('Mise à jour impossible')
    }
  }

  const handleReorder = async (newSteps) => {
    // Optimiste : l'ordre visuel change tout de suite, la réconciliation avec
    // le serveur (source de vérité) arrive juste après.
    setCircuit(c => ({
      ...c,
      etapes: newSteps.map((s, i) => ({ ...c.etapes.find(e => e.id === s.id), ordre: i + 1 })),
    }))
    try {
      const { data } = await circuitsApi.reordonner(id, newSteps.map(s => s.id))
      setCircuit(data)
    } catch {
      toast.error('Réordonnancement impossible')
      load()
    }
  }

  const handleRemove = async (etapeId) => {
    try {
      await etapesApi.delete(etapeId)
      setCircuit(c => ({ ...c, etapes: c.etapes.filter(e => e.id !== etapeId) }))
      toast.success('Étape retirée')
    } catch {
      toast.error('Suppression impossible')
    }
  }

  const linkReservation = async (etapeId, reservationId) => {
    try {
      const { data } = await etapesApi.update(etapeId, { id_reservation: reservationId || null })
      setCircuit(c => ({ ...c, etapes: c.etapes.map(e => (e.id === etapeId ? data : e)) }))
      toast.success('Réservation liée')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Liaison impossible')
    }
  }

  const deleteCircuit = async () => {
    if (!confirm('Supprimer ce circuit ? Vos réservations liées ne seront pas affectées.')) return
    try {
      await circuitsApi.delete(id)
      toast.success('Circuit supprimé')
      navigate('/circuits')
    } catch {
      toast.error('Suppression impossible')
    }
  }

  return (
    <div className="page-circuits">
      <div className="page-hero page-hero--sm">
        {editing ? (
          <form onSubmit={saveInfo} className="circuit-edit-form">
            <input value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} required />
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <button type="submit" className="btn btn--primary btn--sm"><Save size={14} /></button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}><X size={14} /></button>
          </form>
        ) : (
          <>
            <h1>{circuit.libelle}</h1>
            {circuit.description && <p>{circuit.description}</p>}
          </>
        )}
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Link to="/circuits" className="btn btn--ghost btn--sm">← Mes circuits</Link>
          {!editing && (
            <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}><Pencil size={14} /> Renommer</button>
          )}
          <button className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto', color: 'var(--red-dark)' }} onClick={deleteCircuit}>
            <Trash2 size={14} /> Supprimer le circuit
          </button>
        </div>

        <CircuitMap etapes={steps} height={360} />

        <h3 className="circuit-subtitle" style={{ marginTop: '1.5rem' }}>Étapes ({steps.length})</h3>
        <StepList
          steps={steps}
          onReorder={handleReorder}
          onRemove={handleRemove}
          renderTrailing={(step) => {
            const full = circuit.etapes.find(e => e.id === step.id)
            if (step.reservee) return null
            const candidates = mesReservations.filter(r => (step.idSite ? r.id_site === step.idSite : r.id_evnmt === step.idEvnmt))
            if (candidates.length === 0) return null
            return (
              <select
                className="step-list__link-reservation"
                value={full.id_reservation || ''}
                onChange={e => linkReservation(step.id, e.target.value || null)}
              >
                <option value="">Lier une réservation…</option>
                {candidates.map(r => (
                  <option key={r.id} value={r.id}>
                    Réservation #{r.id} ({r.nombre} pers.)
                  </option>
                ))}
              </select>
            )
          }}
        />
      </div>
    </div>
  )
}
