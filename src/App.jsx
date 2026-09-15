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
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '8px',
            boxShadow: '0 4px 24px rgba(0,0,0,.12)',
          },
          success: { iconTheme: { primary: '#E63946', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  )
}
