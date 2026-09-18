import { useState, useEffect } from 'react'
import { MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { responsablesApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ResponsableAValider() {
  const { user } = useAuth()
  const [sites, setSites] = useState([])
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    responsablesApi.aValider()
      .then(r => { setSites(r.data?.sites || []); setEvenements(r.data?.evenements || []) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const validerSite = async (id) => {
    try { await responsablesApi.validerSite(id); toast.success('Site validé'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }
  const rejeterSite = async (id) => {
    try { await responsablesApi.rejeterSite(id); toast.success('Site rejeté'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }
  const validerEvenement = async (id) => {
    try { await responsablesApi.validerEvenement(id); toast.success('Événement validé'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }
  const rejeterEvenement = async (id) => {
    try { await responsablesApi.rejeterEvenement(id); toast.success('Événement rejeté'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  if (loading) return <div className="center-spinner"><Spinner /></div>

  const total = sites.length + evenements.length

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>À valider</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {user?.region?.nom
              ? `Fiches en attente dans la région ${user.region.nom}`
              : 'Responsable global — fiches en attente dans toutes les régions'}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '3rem 0' }}>
          Rien à valider pour l'instant.
        </p>
      ) : (
        <>
          {sites.length > 0 && (
            <div className="admin-section" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--success)" /> Sites ({sites.length})
              </h2>
              <table className="admin-table">
                <thead><tr><th>Nom</th><th>Région</th><th>Catégorie</th><th>Prestataire</th><th>Actions</th></tr></thead>
                <tbody>
                  {sites.map(s => (
                    <tr key={s.id}>
                      <td>{s.libelle}</td>
                      <td>{s.region?.nom || '—'}</td>
                      <td>{s.categorie?.libelle || '—'}</td>
                      <td>{s.prestataire?.nom_entreprise || s.admin?.nom || '—'}</td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-icon-btn admin-icon-btn--success" title="Valider" onClick={() => validerSite(s.id)}><CheckCircle size={15} /></button>
                          <button className="admin-icon-btn admin-icon-btn--danger" title="Rejeter" onClick={() => rejeterSite(s.id)}><XCircle size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {evenements.length > 0 && (
            <div className="admin-section">
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--red)" /> Événements ({evenements.length})
              </h2>
              <table className="admin-table">
                <thead><tr><th>Nom</th><th>Région</th><th>Catégorie</th><th>Prestataire</th><th>Actions</th></tr></thead>
                <tbody>
                  {evenements.map(ev => (
                    <tr key={ev.id}>
                      <td>{ev.libelle}</td>
                      <td>{ev.region?.nom || '—'}</td>
                      <td>{ev.categorie?.libelle || '—'}</td>
                      <td>{ev.prestataire?.nom_entreprise || ev.admin?.nom || '—'}</td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-icon-btn admin-icon-btn--success" title="Valider" onClick={() => validerEvenement(ev.id)}><CheckCircle size={15} /></button>
                          <button className="admin-icon-btn admin-icon-btn--danger" title="Rejeter" onClick={() => rejeterEvenement(ev.id)}><XCircle size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
