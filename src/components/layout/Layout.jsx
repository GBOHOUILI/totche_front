import { Link, Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <Link to="/circuits#circuit-ia" className="ai-fab">
        <Sparkles size={17} />
        <span>Composer avec l'IA</span>
      </Link>
    </div>
  )
}
