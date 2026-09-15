import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import Home from '../pages/public/Home'
import Sites from '../pages/public/Sites'
import SiteDetail from '../pages/public/SiteDetail'
import Evenements from '../pages/public/Evenements'
import EvenementDetail from '../pages/public/EvenementDetail'
import { Login, Register } from '../pages/auth/Auth'
import AdminLogin from '../pages/admin/AdminLogin'
import { APropos, Contact } from '../pages/public/AProposContact'
import Profil from '../pages/user/Profil'
import MesReservations from '../pages/user/MesReservations'
import { Spinner } from '../components/ui/index'


const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const AdminSites = lazy(() => import('../pages/admin/AdminSites'))
const AdminEvenements = lazy(() => import('../pages/admin/AdminEvenements'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'))
const AdminPrix = lazy(() => import('../pages/admin/AdminPrix'))
const AdminAvis = lazy(() => import('../pages/admin/AdminAvis'))
const AdminAdmins = lazy(() => import('../pages/admin/AdminAdmins'))
const AdminTickets = lazy(() => import('../pages/admin/AdminTickets'))
const AdminTarifs = lazy(() => import('../pages/admin/AdminPrix'))

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/connexion" replace />
  return <Outlet />
}

function RequireAdmin() {
  const { isAdmin, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return (
    <Suspense fallback={<div className="page-loading"><Spinner size="lg" /></div>}>
      <Outlet />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sites', element: <Sites /> },
      { path: 'sites/:id', element: <SiteDetail /> },
      { path: 'evenements', element: <Evenements /> },
      { path: 'evenements/:id', element: <EvenementDetail /> },
      { path: 'connexion', element: <Login /> },
      { path: 'inscription', element: <Register /> },
      { path: 'a-propos', element: <APropos /> },
      { path: 'contacts', element: <Contact /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'profil', element: <Profil /> },
          { path: 'mes-reservations', element: <MesReservations /> },
        ]
      }
    ]
  },
  { path: '/admin/login', element: <AdminLogin /> },
{
  path: '/admin',
  element: <RequireAdmin />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboard /> },

        { path: 'sites', element: <AdminSites /> },
        { path: 'evenements', element: <AdminEvenements /> },
        { path: 'categories', element: <AdminCategories /> },
        { path: 'utilisateurs', element: <AdminUsers /> },

        { path: 'tarifs', element: <AdminTarifs /> },
        { path: 'avis', element: <AdminAvis /> },
        { path: 'tickets', element: <AdminTickets /> },
        { path: 'admins', element: <AdminAdmins /> },
      ]
    }
  ]
}
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
