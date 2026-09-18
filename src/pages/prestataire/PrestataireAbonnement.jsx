import { useState, useEffect, useCallback } from 'react'
import { CreditCard } from 'lucide-react'
import { abonnementsApi, plansApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

const STATUT_LABEL = { en_attente: 'En attente de paiement', actif: 'Actif', expire: 'Expiré', annule: 'Annulé' }
const STATUT_COLOR = { en_attente: 'warning', actif: 'success', expire: 'danger', annule: 'danger' }
const FACTURE_LABEL = { payee: 'Payée', echouee: 'Échouée', en_attente: 'En attente' }
const FACTURE_COLOR = { payee: 'success', echouee: 'danger', en_attente: 'warning' }

// Même mécanisme que MesReservations.jsx (commandesApi/paiementsApi) : le montant et
// l'identifiant de facture viennent du serveur, jamais recalculés côté client.
function PayerFactureButton({ facture, onPaid }) {
  const [loading, setLoading] = useState(false)

  const handlePay = () => {
    setLoading(true)
    let handled = false

    window.addSuccessListener(async (response) => {
      if (handled) return
      handled = true
      try {
        await abonnementsApi.verifierFacture(facture.id, response.transactionId)
        toast.success('Paiement confirmé, abonnement activé !')
        onPaid?.()
      } catch {
        toast.error("Paiement reçu par Kkiapay mais pas encore confirmé côté serveur - patientez puis rafraîchissez.")
      } finally {
        setLoading(false)
      }
    })
    window.addFailedListener(() => {
      if (handled) return
      handled = true
      setLoading(false)
      toast.error('Paiement annulé ou échoué.')
    })

    window.openKkiapayWidget({
      amount: Number(facture.montant),
      key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
      sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true',
      data: String(facture.id),
    })
  }

  return (
    <button className="btn btn--primary" onClick={handlePay} disabled={loading}>
      <CreditCard size={16} /> {loading ? 'Paiement en cours…' : 'Payer maintenant'}
    </button>
  )
}

export default function PrestataireAbonnement() {
  const [data, setData] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [souscrivant, setSouscrivant] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([abonnementsApi.statut(), plansApi.list()])
      .then(([s, p]) => { setData(s.data); setPlans(p.data || []) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSouscrire = async (idPlan) => {
    setSouscrivant(idPlan)
    try {
      await abonnementsApi.souscrire(idPlan)
      toast.success('Facture générée, procédez au paiement ci-dessous.')
      await load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la souscription')
    } finally {
      setSouscrivant(null)
    }
  }

  if (loading) return <div className="center-spinner"><Spinner /></div>

  const abonnement = data?.abonnement
  const factureEnAttente = abonnement?.factures?.find(f => f.statut_paiement === 'en_attente')

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Abonnement</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Un abonnement actif est nécessaire pour créer des fiches (Sites, Événements, Hôtels, Restaurants, Transports).
          </p>
        </div>
      </div>

      {abonnement && (
        <div className="admin-section" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className={`status-badge status-badge--${STATUT_COLOR[abonnement.statut]}`}>
                {STATUT_LABEL[abonnement.statut]}
              </span>
              <h2 style={{ marginTop: '0.5rem' }}>{abonnement.plan?.nom}</h2>
              {abonnement.date_fin && (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  {data.actif ? "Valide jusqu'au " : 'Expiré le '}
                  {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            {factureEnAttente && <PayerFactureButton facture={factureEnAttente} onPaid={load} />}
          </div>
        </div>
      )}

      {!data?.actif && (
        <div className="admin-section">
          <h2 style={{ marginBottom: '1rem' }}>{abonnement ? 'Changer de plan' : 'Choisir un plan'}</h2>
          {plans.length === 0 ? (
            <p style={{ color: 'var(--gray-500)' }}>Aucun plan disponible pour le moment.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {plans.map(plan => (
                <div key={plan.id} className="admin-stat-card">
                  <h3>{plan.nom}</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.35rem 0' }}>
                    {Number(plan.prix_mensuel).toLocaleString('fr-FR')} FCFA
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--gray-500)' }}>/mois</span>
                  </p>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                    {plan.nombre_fiches_max ? `${plan.nombre_fiches_max} fiches max` : 'Fiches illimitées'}
                  </p>
                  {plan.fonctionnalites?.length > 0 && (
                    <ul style={{ fontSize: '0.8rem', color: 'var(--gray-700)', marginTop: '0.5rem', paddingLeft: '1.1rem' }}>
                      {plan.fonctionnalites.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                  <button
                    className="btn btn--primary"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={() => handleSouscrire(plan.id)}
                    disabled={souscrivant === plan.id}
                  >
                    {souscrivant === plan.id ? '...' : 'Souscrire'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {abonnement?.factures?.length > 0 && (
        <div className="admin-section" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Historique des factures</h2>
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>
              {abonnement.factures.map(f => (
                <tr key={f.id}>
                  <td>{f.date_facturation ? new Date(f.date_facturation).toLocaleDateString('fr-FR') : '-'}</td>
                  <td>{Number(f.montant).toLocaleString('fr-FR')} FCFA</td>
                  <td>
                    <span className={`status-badge status-badge--${FACTURE_COLOR[f.statut_paiement]}`}>
                      {FACTURE_LABEL[f.statut_paiement]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
