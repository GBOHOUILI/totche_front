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
import PrestataireLogin from '../pages/prestataire/PrestataireLogin'
import PrestataireRegister from '../pages/prestataire/PrestataireRegister'
import ResponsableLogin from '../pages/responsable/ResponsableLogin'
import { APropos, Contact } from '../pages/public/AProposContact'
import Profil from '../pages/user/Profil'
import MesReservations from '../pages/user/MesReservations'
import Circuits from '../pages/public/Circuits'
import CircuitDetail from '../pages/public/CircuitDetail'
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
const AdminResponsables = lazy(() => import('../pages/admin/AdminResponsables'))

const ResponsableLayout = lazy(() => import('../pages/responsable/ResponsableLayout'))
const ResponsableAValider = lazy(() => import('../pages/responsable/ResponsableAValider'))

const PrestataireLayout = lazy(() => import('../pages/prestataire/PrestataireLayout'))
const PrestataireDashboard = lazy(() => import('../pages/prestataire/PrestataireDashboard'))
const PrestataireSites = lazy(() => import('../pages/prestataire/PrestataireSites'))
const PrestataireEvenements = lazy(() => import('../pages/prestataire/PrestataireEvenements'))
const PrestataireProfil = lazy(() => import('../pages/prestataire/PrestataireProfil'))

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

function RequirePrestataire() {
  const { isPrestataire, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/prestataire/login" replace />
  if (!isPrestataire) return <Navigate to="/" replace />
  return (
    <Suspense fallback={<div className="page-loading"><Spinner size="lg" /></div>}>
      <Outlet />
    </Suspense>
  )
}

function RequireResponsable() {
  const { isResponsable, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/responsable/login" replace />
  if (!isResponsable) return <Navigate to="/" replace />
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
      { path: 'circuits', element: <Circuits /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'profil', element: <Profil /> },
          { path: 'mes-reservations', element: <MesReservations /> },
          { path: 'circuits/:id', element: <CircuitDetail /> },
        ]
      }
    ]
  },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/prestataire/login', element: <PrestataireLogin /> },
  { path: '/prestataire/inscription', element: <PrestataireRegister /> },
  { path: '/responsable/login', element: <ResponsableLogin /> },
  {
    path: '/responsable',
    element: <RequireResponsable />,
    children: [
      {
        element: <ResponsableLayout />,
        children: [
          { index: true, element: <ResponsableAValider /> },
        ]
      }
    ]
  },
  {
    path: '/prestataire',
    element: <RequirePrestataire />,
    children: [
      {
        element: <PrestataireLayout />,
        children: [
          { index: true, element: <PrestataireDashboard /> },
          { path: 'sites', element: <PrestataireSites /> },
          { path: 'evenements', element: <PrestataireEvenements /> },
          { path: 'profil', element: <PrestataireProfil /> },
        ]
      }
    ]
  },
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
        { path: 'responsables', element: <AdminResponsables /> },
      ]
    }
  ]
}
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
