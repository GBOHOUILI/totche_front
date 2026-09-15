import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Rediriger vers le bon login selon le rôle
      if (user?.role === 'admin') {
        window.location.href = '/admin/login'
      } else {
        window.location.href = '/connexion'
      }
    }
    return Promise.reject(err)
  }
)

export default api
