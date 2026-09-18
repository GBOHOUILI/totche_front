import { useState, useEffect } from 'react'
import { abonnementsApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'

const STATUT_LABEL = { en_attente: 'En attente de paiement', actif: 'Actif', expire: 'Expiré', annule: 'Annulé' }
const STATUT_COLOR = { en_attente: 'warning', actif: 'success', expire: 'danger', annule: 'danger' }

export default function AdminAbonnements() {
  const [abonnements, setAbonnements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    abonnementsApi.adminList()
      .then(r => setAbonnements(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Abonnements</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {abonnements.length} abonnement(s) prestataire - lecture seule, géré depuis le portail Prestataire
          </p>
        </div>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Prestataire</th>
              <th>Plan</th>
              <th>Statut</th>
              <th>Période</th>
            </tr>
          </thead>
          <tbody>
            {abonnements.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun abonnement</td></tr>
            ) : abonnements.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.prestataire?.nom_entreprise || '-'}</td>
                <td>{a.plan?.nom || '-'}</td>
                <td>
                  <span className={`status-badge status-badge--${STATUT_COLOR[a.statut]}`}>
                    {STATUT_LABEL[a.statut]}
                  </span>
                </td>
                <td>
                  {a.date_debut && a.date_fin
                    ? `${new Date(a.date_debut).toLocaleDateString('fr-FR')} → ${new Date(a.date_fin).toLocaleDateString('fr-FR')}`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
