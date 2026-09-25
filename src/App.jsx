import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { FavorisProvider } from './context/FavorisContext'
import AppRouter from './router/index'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <FavorisProvider>
        <AppRouter />
      </FavorisProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Karla, sans-serif',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--white)' } },
        }}
      />
    </AuthProvider>
  )
}
