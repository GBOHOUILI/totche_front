import { useState, useEffect } from 'react'
import { Search, CheckCircle, Clock, Ticket as TicketIcon, X, QrCode } from 'lucide-react'
import { ticketsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const StatusBadge = ({ utilise }) => (
  <span style={{
    fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '20px',
    background: utilise ? '#dcfce7' : '#fef9c3',
    color:      utilise ? '#16a34a' : '#ca8a04',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  }}>
    {utilise ? <><CheckCircle size={11} /> Utilisé</> : <><Clock size={11} /> Valide</>}
  </span>
)

export default function AdminTickets() {
  const [tickets, setTickets]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchNum, setSearchNum] = useState('')
  const [searchResult, setSearchResult] = useState(null) // null | 'loading' | obj | 'not_found'
  const [selected, setSelected]   = useState(null)
  const [page, setPage]           = useState(1)
  const [meta, setMeta]           = useState(null)

  useEffect(() => { load() }, [page])

  const load = () => {
    setLoading(true)
    ticketsApi.list()
      .then(r => {
        setTickets(r.data?.data || r.data || [])
        setMeta(r.data?.meta || { total: r.data?.total, last_page: r.data?.last_page, current_page: r.data?.current_page })
      })
      .finally(() => setLoading(false))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchNum.trim()) return
    setSearchResult('loading')
    try {
      const r = await ticketsApi.verify(searchNum.trim())
      setSearchResult(r.data?.ticket || r.data || null)
    } catch (err) {
      if (err.response?.status === 404) setSearchResult('not_found')
      else { setSearchResult(null); toast.error('Erreur lors de la recherche') }
    }
  }

  const handleValidate = async (numero) => {
    try {
      await ticketsApi.use(numero)
      toast.success('Ticket marqué comme utilisé !')
      setSearchResult(null)
      setSearchNum('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Tickets</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {meta?.total ?? tickets.length} ticket(s) générés
          </p>
        </div>
      </div>

      {/* Vérificateur de ticket */}
      <div className="admin-section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} /> Vérifier un ticket
        </h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="admin-form__field" style={{ flex: 1, marginBottom: 0 }}>
            <label>Numéro de ticket</label>
            <input
              value={searchNum}
              onChange={e => { setSearchNum(e.target.value); setSearchResult(null) }}
              placeholder="Ex : TCK-ABCD1234"
              style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={!searchNum.trim()}>
            Vérifier
          </button>
        </form>

        {/* Résultat de recherche */}
        {searchResult === 'loading' && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}><Spinner /></div>
        )}
        {searchResult === 'not_found' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <X size={16} /> Aucun ticket trouvé avec ce numéro.
          </div>
        )}
        {searchResult && searchResult !== 'loading' && searchResult !== 'not_found' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: searchResult.utilise ? '#f0fdf4' : '#fffbeb', border: `1px solid ${searchResult.utilise ? '#bbf7d0' : '#fde68a'}`, borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{searchResult.numero}</p>
                <StatusBadge utilise={searchResult.utilise} />
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {searchResult.reservation?.site && <p>📍 {searchResult.reservation.site.libelle}</p>}
                  {searchResult.reservation?.evenement && <p>🎉 {searchResult.reservation.evenement.libelle}</p>}
                  {searchResult.reservation?.total && <p>💰 {Number(searchResult.reservation.total).toLocaleString('fr-FR')} FCFA</p>}
                  {searchResult.created_at && <p>🗓 Émis le {new Date(searchResult.created_at).toLocaleDateString('fr-FR')}</p>}
                </div>
              </div>
              {!searchResult.utilise && (
                <button className="btn btn--primary"
                  onClick={() => handleValidate(searchResult.numero)}
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                  <CheckCircle size={16} /> Valider l'entrée
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Liste des tickets */}
      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Site / Événement</th>
                <th>Utilisateur</th>
                <th>Total</th>
                <th>Émis le</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun ticket</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>{t.numero}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {t.reservation?.site?.libelle || t.reservation?.evenement?.libelle || '—'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {t.reservation?.user?.nom || '—'}
                  </td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {t.reservation?.total ? `${Number(t.reservation.total).toLocaleString('fr-FR')} FCFA` : '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td><StatusBadge utilise={t.utilise} /></td>
                </tr>
              ))}
            </tbody>
          </table>

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

      {/* Modal détail ticket */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Ticket {selected.numero}</h2>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 0 1rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: '10px', marginBottom: '1rem' }}>
                <TicketIcon size={36} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.1em' }}>{selected.numero}</p>
                <div style={{ marginTop: '0.75rem' }}><StatusBadge utilise={selected.utilise} /></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Destination</span>
                  <span style={{ fontWeight: 500 }}>{selected.reservation?.site?.libelle || selected.reservation?.evenement?.libelle || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Utilisateur</span>
                  <span style={{ fontWeight: 500 }}>{selected.reservation?.user?.nom || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Montant total</span>
                  <span style={{ fontWeight: 600 }}>{selected.reservation?.total ? `${Number(selected.reservation.total).toLocaleString('fr-FR')} FCFA` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Date d'émission</span>
                  <span>{selected.created_at ? new Date(selected.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                </div>
                {selected.utilise && selected.updated_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Utilisé le</span>
                    <span>{new Date(selected.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>
            {!selected.utilise && (
              <div className="admin-form__footer">
                <button className="btn btn--ghost" onClick={() => setSelected(null)}>Fermer</button>
                <button className="btn btn--primary" style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleValidate(selected.numero)}>
                  <CheckCircle size={15} /> Valider l'entrée
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}