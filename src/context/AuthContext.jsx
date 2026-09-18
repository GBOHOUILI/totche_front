import { createContext, useContext, useState } from 'react'
import { authApi, prestatairesApi, responsablesApi } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isPrestataire = user?.role === 'prestataire'
  const isResponsable = user?.role === 'responsable'

  const _save = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  // Login user: { email, password }
  const login = async (credentials) => {
    setLoading(true)
    try {
      const res = await authApi.login(credentials)
      const token = res.data?.token || res.data?.access_token
      const user = res.data?.user || res.data?.data
      _save(token, { ...user, role: 'user' })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Identifiants incorrects' }
    } finally { setLoading(false) }
  }

  // Login admin: { tel, password }
  const loginAdmin = async (credentials) => {
    setLoading(true)
    try {
      const res = await authApi.loginAdmin(credentials)
      const token = res.data?.token || res.data?.access_token
      const admin = res.data?.admin || res.data?.user || res.data?.data
      _save(token, { ...admin, role: 'admin' })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Identifiants incorrects' }
    } finally { setLoading(false) }
  }

  // Login prestataire: { email, password }
  const loginPrestataire = async (credentials) => {
    setLoading(true)
    try {
      const res = await prestatairesApi.login(credentials)
      const token = res.data?.token || res.data?.access_token
      const prestataire = res.data?.prestataire || res.data?.data
      _save(token, { ...prestataire, role: 'prestataire' })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Identifiants incorrects' }
    } finally { setLoading(false) }
  }

  // Login responsable régional: { tel, password }
  const loginResponsable = async (credentials) => {
    setLoading(true)
    try {
      const res = await responsablesApi.login(credentials)
      const token = res.data?.token || res.data?.access_token
      const responsable = res.data?.responsable || res.data?.data
      _save(token, { ...responsable, role: 'responsable' })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Identifiants incorrects' }
    } finally { setLoading(false) }
  }

  // Register prestataire: { nom_entreprise, type_prestataire, email, tel, password, password_confirmation }
  const registerPrestataire = async (data) => {
    setLoading(true)
    try {
      const res = await prestatairesApi.register(data)
      const token = res.data?.token || res.data?.access_token
      const prestataire = res.data?.prestataire || res.data?.data
      if (token) _save(token, { ...prestataire, role: 'prestataire' })
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur d'inscription",
        errors: err.response?.data?.errors
      }
    } finally { setLoading(false) }
  }

  // Register: { nom, prenom, tel, email, password, password_confirmation, nationalite }
  const register = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.register(data)
      const token = res.data?.token || res.data?.access_token
      const user = res.data?.user || res.data?.data
      if (token) _save(token, { ...user, role: 'user' })
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur d'inscription",
        errors: err.response?.data?.errors
      }
    } finally { setLoading(false) }
  }

  const logout = async () => {
    try {
      if (isPrestataire) await prestatairesApi.logout()
      else if (isResponsable) await responsablesApi.logout()
      else if (isAdmin) await authApi.logoutAdmin()
      else await authApi.logout()
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isPrestataire, isResponsable,
      isAuthenticated: !!token,
      login, loginAdmin, loginPrestataire, loginResponsable, register, registerPrestataire, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
