import { useState, useEffect, useRef } from 'react'
import { Search, CheckCircle, Clock, Ticket as TicketIcon, X, ScanLine } from 'lucide-react'
import { ticketsApi, utilisationsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

// Un ticket est "utilisé" si une Utilisation existe déjà pour lui — jamais un champ
// direct de l'API. Selon la source, cette info arrive soit via la relation
// `utilisations` (liste /admin/tickets), soit via `deja_utilise` (POST /tickets/verifier).
const estUtilise = (ticket) =>
  ticket?.deja_utilise === true || (ticket?.utilisations?.length ?? 0) > 0

const StatusBadge = ({ utilise }) => (
  <span className={`status-badge status-badge--${utilise ? 'success' : 'warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
  const [scanMode, setScanMode]   = useState(false)
  const scannerRef = useRef(null)

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

  const rechercherNumero = async (numero) => {
    setSearchResult('loading')
    try {
      const r = await ticketsApi.verifier(numero)
      setSearchResult(r.data?.ticket ? { ...r.data.ticket, deja_utilise: r.data.deja_utilise } : null)
    } catch (err) {
      if (err.response?.status === 404) setSearchResult('not_found')
      else { setSearchResult(null); toast.error('Erreur lors de la recherche') }
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchNum.trim()) return
    rechercherNumero(searchNum.trim())
  }

  // Action explicite et séparée : ce n'est jamais un effet de bord de la vérification.
  const handleValidate = async (ticket) => {
    const now = new Date()
    try {
      await utilisationsApi.create({
        id_ticket: ticket.id,
        date_visite: now.toISOString().slice(0, 10),
        heure: now.toTimeString().slice(0, 5),
      })
      toast.success('Ticket marqué comme utilisé !')
      setSearchResult(null)
      setSearchNum('')
      setSelected(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  // Scanner caméra : décode un QR (le contenu attendu est le numero du ticket) et
  // réutilise exactement le même chemin qu'une saisie manuelle.
  useEffect(() => {
    if (!scanMode) return
    let actif = true

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!actif) return
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
      scannerRef.current = scanner
      scanner.render(
        (decodedText) => {
          setSearchNum(decodedText)
          setScanMode(false)
          rechercherNumero(decodedText)
        },
        () => {}, // erreurs de frame ignorées (pas de QR dans l'image courante)
      )
    })

    return () => {
      actif = false
      scannerRef.current?.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [scanMode])

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Search size={16} /> Vérifier un ticket
          </h2>
          <button
            type="button"
            className={`btn btn--sm ${scanMode ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setScanMode(v => !v)}
          >
            <ScanLine size={14} /> {scanMode ? 'Fermer le scanner' : 'Scanner un QR'}
          </button>
        </div>

        {scanMode && (
          <div style={{ marginBottom: '1rem' }}>
            <div id="qr-reader" style={{ maxWidth: 400 }} />
          </div>
        )}

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
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'color-mix(in srgb, var(--red) 12%, var(--white))', borderRadius: 'var(--radius)', color: 'var(--red-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <X size={16} /> Aucun ticket trouvé avec ce numéro.
          </div>
        )}
        {searchResult && searchResult !== 'loading' && searchResult !== 'not_found' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: estUtilise(searchResult) ? 'color-mix(in srgb, var(--success) 10%, var(--white))' : 'color-mix(in srgb, var(--warning) 10%, var(--white))', border: `1px solid ${estUtilise(searchResult) ? 'var(--success)' : 'var(--warning)'}`, borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{searchResult.numero}</p>
                <StatusBadge utilise={estUtilise(searchResult)} />
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--gray-700)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {searchResult.reservation?.site && <p>📍 {searchResult.reservation.site.libelle}</p>}
                  {searchResult.reservation?.evenement && <p>🎉 {searchResult.reservation.evenement.libelle}</p>}
                  {searchResult.reservation?.total && <p>💰 {Number(searchResult.reservation.total).toLocaleString('fr-FR')} FCFA</p>}
                  {searchResult.created_at && <p>🗓 Émis le {new Date(searchResult.created_at).toLocaleDateString('fr-FR')}</p>}
                </div>
              </div>
              {!estUtilise(searchResult) && (
                <button className="btn btn--primary"
                  onClick={() => handleValidate(searchResult)}
                  style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
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
                  <td><StatusBadge utilise={estUtilise(t)} /></td>
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
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--gray-100)', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                <TicketIcon size={36} color="var(--red)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.1em' }}>{selected.numero}</p>
                <div style={{ marginTop: '0.75rem' }}><StatusBadge utilise={estUtilise(selected)} /></div>
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
                {estUtilise(selected) && selected.utilisations?.[0]?.date_visite && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Utilisé le</span>
                    <span>{new Date(selected.utilisations[0].date_visite).toLocaleDateString('fr-FR')} {selected.utilisations[0].heure || ''}</span>
                  </div>
                )}
              </div>
            </div>
            {!estUtilise(selected) && (
              <div className="admin-form__footer">
                <button className="btn btn--ghost" onClick={() => setSelected(null)}>Fermer</button>
                <button className="btn btn--primary" style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                  onClick={() => handleValidate(selected)}>
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
