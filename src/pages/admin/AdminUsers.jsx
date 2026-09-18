import { useState, useEffect } from 'react'
import { Trash2, Eye } from 'lucide-react'
import { usersApi } from '../../api/services'
import { Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => { load() }, [page])

  const load = () => {
    setLoading(true)
    usersApi.list()
      .then(r => {
        setUsers(r.data?.data || r.data || [])
        setMeta(r.data?.meta || null)
      })
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try { await usersApi.delete(id); toast.success('Utilisateur supprimé'); load() }
    catch { toast.error('Erreur lors de la suppression') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Utilisateurs</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          {meta?.total || users.length} utilisateur(s) inscrit(s)
        </p>
      </div>

      {loading ? <div className="center-spinner"><Spinner /></div> : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Nationalité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Aucun utilisateur</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.nom}</strong> {u.prenom}</td>
                  <td>{u.email}</td>
                  <td>{u.tel || '-'}</td>
                  <td>{u.nationalite || '-'}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-icon-btn admin-icon-btn--danger" title="Supprimer"
                        onClick={() => handleDelete(u.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta && meta.last_page > 1 && (
            <div className="pagination" style={{ marginTop: '1.5rem' }}>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
                  onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
