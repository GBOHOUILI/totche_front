import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="navbar__logo-icon">T</span>
              <span className="navbar__logo-text">otché</span>
            </Link>
            <p>La plateforme de gestion des sites touristiques et événements culturels du Bénin.</p>
            <div className="footer__socials">
              <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div className="footer__col">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/sites">Sites Touristiques</Link></li>
              <li><Link to="/evenements">Événements</Link></li>
              <li><Link to="/a-propos">À Propos</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/inscription">Créer un compte</Link></li>
              <li><Link to="/connexion">Se connecter</Link></li>
              <li><Link to="/contacts">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="footer__col">
            <h4>Nous Contacter</h4>
            <ul className="footer__contact">
              <li><MapPin size={14} /><span>Cotonou, Bénin</span></li>
              <li><Phone size={14} /><span>+229 01 67 75 88 20</span></li>
              <li><Mail size={14} /><span>ajustinsena@gmail.com</span></li>
            </ul>
            <h4 style={{marginTop:'1.5rem'}}>Newsletter</h4>
            <form className="footer__newsletter" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Votre adresse email" />
              <button type="submit">S'abonner</button>
            </form>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Totché – Tous droits réservés</p>
          <p>Bénin Tourisme · Sen Impact Technologies</p>
        </div>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        <span>Totché</span>
      </div>
    </footer>
  )
}
