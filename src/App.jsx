import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './router/index'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Karla, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '4px',
            boxShadow: '0 6px 24px rgba(32,44,70,.14)',
          },
          success: { iconTheme: { primary: '#3D6B4F', secondary: '#FFFCF6' } },
        }}
      />
    </AuthProvider>
  )
}
