import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, X } from 'lucide-react'
import { avisApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const STATUS_LABELS = {
  en_attente: { label: 'En attente', variant: 'warning' },
  approuve:   { label: 'Approuvé',   variant: 'success' },
  rejete:     { label: 'Rejeté',     variant: 'danger' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_LABELS[status] || STATUS_LABELS['en_attente']
  return (
    <span className={`status-badge status-badge--${s.variant}`}>
      {s.label}
    </span>
  )
}

// L'API n'expose pas directement { user, site, evenement } sur l'avis : ces
// infos remontent via la chaîne avis -> utilisation -> ticket -> reservation.
// Pas de note chiffrée dans le modèle Avis actuel (seulement message + status).
const avisUser = (a) => a.utilisation?.ticket?.reservation?.user
const avisCible = (a) => {
  const reservation = a.utilisation?.ticket?.reservation
  if (reservation?.site) return { libelle: reservation.site.libelle, type: 'Site touristique' }
  if (reservation?.evenement) return { libelle: reservation.evenement.libelle, type: 'Événement' }
  return { libelle: '-', type: '-' }
}

export default function AdminAvis() {
  const [avis, setAvis]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('') // '' | 'en_attente' | 'approuve' | 'rejete'
  const [selected, setSelected] = useState(null) // avis detail modal
  const [page, setPage]       = useState(1)
  const [meta, setMeta]       = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { load() }, [filter, page])

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter) params.status = filter
    avisApi.list(params)
      .then(r => {
        setAvis(r.data?.data || r.data || [])
        setMeta(r.data?.meta || { total: r.data?.total, last_page: r.data?.last_page, current_page: r.data?.current_page })
      })
      .finally(() => setLoading(false))
  }

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve')
    try {
      await avisApi.approuver(id)
      toast.success('Avis approuvé !')
      setSelected(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setActionLoading(null) }
  }

  const handleReject = async (id) => {
    setActionLoading(id + '_reject')
    try {
      await avisApi.rejeter(id)
      toast.success('Avis rejeté.')
      setSelected(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return
    try {
      await avisApi.delete(id)
      toast.success('Avis supprimé.')
      setSelected(null)
      load()
    } catch { toast.error('Erreur lors de la suppression') }
  }

  const filters = [
    { key: '', label: 'Tous' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'approuve',   label: 'Approuvés' },
    { key: 'rejete',     label: 'Rejetés' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Modération des avis</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {meta?.total ?? avis.length} avis au total
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters__cats" style={{ marginBottom: '1.5rem' }}>
        {filters.map(f => (
          <button key={f.key}
            className={`filters__cat ${filter === f.key ? 'filters__cat--active' : ''}`}
            onClick={() => { setFilter(f.key); setPage(1) }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Utilisateur</th>
                <th>Cible</th>
                <th>Message</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {avis.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun avis</td></tr>
              ) : avis.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td><strong>{avisUser(a)?.nom || '-'}</strong></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-700)' }}>
                    {avisCible(a).libelle}
                  </td>
                  <td style={{ fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.message || <span style={{ color: 'var(--gray-500)' }}>Aucun commentaire</span>}
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-icon-btn" title="Voir" onClick={() => setSelected(a)}><Eye size={15} /></button>
                      {(a.status || a.statut) !== 'approuve' && (
                        <button className="admin-icon-btn" title="Approuver"
                          style={{ color: 'var(--success)' }}
                          disabled={actionLoading === a.id + '_approve'}
                          onClick={() => handleApprove(a.id)}>
                          <CheckCircle size={15} />
                        </button>
                      )}
                      {(a.status || a.statut) !== 'rejete' && (
                        <button className="admin-icon-btn admin-icon-btn--danger" title="Rejeter"
                          disabled={actionLoading === a.id + '_reject'}
                          onClick={() => handleReject(a.id)}>
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta?.last_page > 1 && (
            <div className="pagination" style={{ marginTop: '1.5rem' }}>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
                  onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal détail avis */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Détail de l'avis #{selected.id}</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 0 1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Utilisateur</p>
                  <p style={{ fontWeight: 600 }}>{avisUser(selected)?.nom} {avisUser(selected)?.prenom || ''}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{avisUser(selected)?.email || '-'}</p>
                </div>
                <div style={{ background: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Cible</p>
                  <p style={{ fontWeight: 600 }}>{avisCible(selected).libelle}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{avisCible(selected).type}</p>
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.4rem' }}>Commentaire</p>
                <p style={{ background: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {selected.message || <em style={{ color: 'var(--gray-500)' }}>Aucun commentaire</em>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <StatusBadge status={selected.status} />
                <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                  {selected.created_at ? new Date(selected.created_at).toLocaleDateString('fr-FR') : ''}
                </span>
              </div>
            </div>
            <div className="admin-form__footer">
              <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red-dark)' }} onClick={() => handleDelete(selected.id)}>Supprimer</button>
              {(selected.status || selected.statut) !== 'rejete' && (
                <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red-dark)', border: '1px solid var(--red-dark)' }}
                  disabled={actionLoading === selected.id + '_reject'}
                  onClick={() => handleReject(selected.id)}>
                  Rejeter
                </button>
              )}
              {(selected.status || selected.statut) !== 'approuve' && (
                <button className="btn btn--primary btn--sm"
                  disabled={actionLoading === selected.id + '_approve'}
                  onClick={() => handleApprove(selected.id)}>
                  Approuver
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}