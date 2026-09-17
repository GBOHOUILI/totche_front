import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, User, Menu, X, ChevronDown, Landmark, Trees, Building2, Milestone, Waves, PartyPopper, Music2, Image, Flame, Store, Tag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { categoriesApi } from '../../api/services'

const SITE_CAT_META = {
  'Patrimoine historique': { icon: Landmark, tagline: 'Palais royaux et vestiges d’un royaume millénaire' },
  'Site naturel': { icon: Trees, tagline: 'Lacs, forêts classées et réserves à ciel ouvert' },
  'Musée': { icon: Building2, tagline: 'Collections et mémoire vivante du Bénin' },
  'Monument': { icon: Milestone, tagline: 'Lieux de mémoire et d’histoire partagée' },
  'Plage': { icon: Waves, tagline: 'Sable fin, cocotiers et façade atlantique' },
}
const EVENT_CAT_META = {
  'Festival culturel': { icon: PartyPopper, tagline: 'Danses, rites et traditions vivantes' },
  'Concert': { icon: Music2, tagline: 'Musiques et scènes béninoises' },
  'Exposition': { icon: Image, tagline: 'Art, artisanat et savoir-faire locaux' },
  'Cérémonie traditionnelle': { icon: Flame, tagline: 'Rituels vodun et cérémonies ancestrales' },
  'Foire': { icon: Store, tagline: 'Marchés et rencontres artisanales' },
}

function CatMegaMenu({ categories, meta, basePath, featured }) {
  return (
    <div className="mega-menu" onMouseDown={e => e.stopPropagation()}>
      <div className="mega-menu__grid">
        {categories.map(cat => {
          const info = meta[cat.libelle] || { icon: Tag, tagline: 'Explorez cette catégorie' }
          const Icon = info.icon
          return (
            <Link key={cat.id} to={`${basePath}?categorie=${cat.id}`} className="mega-menu__item">
              <Icon size={18} />
              <span>
                <strong>{cat.libelle}</strong>
                <em>{info.tagline}</em>
              </span>
            </Link>
          )
        })}
      </div>
      {featured && (
        <div className="mega-menu__featured">
          <img src={featured.img} alt="" />
          <div>
            <h4>{featured.title}</h4>
            <p>{featured.text}</p>
            <Link to={basePath}>Tout découvrir</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [openMega, setOpenMega] = useState(null) // 'sites' | 'evenements' | null
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [siteCats, setSiteCats] = useState([])
  const [eventCats, setEventCats] = useState([])
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    categoriesApi.sites().then(r => setSiteCats(r.data?.data || r.data || [])).catch(() => {})
    categoriesApi.evenements().then(r => setEventCats(r.data?.data || r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  const handleLogout = async () => {
    await logout()
    setUserMenu(false)
    navigate('/')
  }

  const submitSearch = (e) => {
    e.preventDefault()
    if (!searchValue.trim()) return
    navigate(`/sites?q=${encodeURIComponent(searchValue.trim())}`)
    setSearchOpen(false)
    setSearchValue('')
  }

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/sites', label: 'Sites Touristiques', mega: 'sites' },
    { to: '/evenements', label: 'Événements', mega: 'evenements' },
    { to: '/circuits', label: 'Circuits' },
    { to: '/a-propos', label: 'À Propos' },
    { to: '/contacts', label: 'Contacts' },
  ]

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">T</span>
          <span className="navbar__logo-text">otché</span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links">
          {navLinks.map(({ to, label, mega }) => (
            <li
              key={to}
              className="navbar__item"
              onMouseEnter={() => mega && setOpenMega(mega)}
              onMouseLeave={() => mega && setOpenMega(null)}
            >
              <NavLink to={to} end={to === '/'}
                className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}${mega ? ' navbar__link--mega' : ''}`}>
                {label}
                {mega && <ChevronDown size={13} className={`navbar__chevron${openMega === mega ? ' navbar__chevron--open' : ''}`} />}
              </NavLink>
              {mega === 'sites' && openMega === 'sites' && siteCats.length > 0 && (
                <CatMegaMenu
                  categories={siteCats}
                  meta={SITE_CAT_META}
                  basePath="/sites"
                  featured={{
                    img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Royal%20Palaces%20of%20Abomey-133469.jpg?width=500',
                    title: 'Palais Royal d’Abomey',
                    text: 'Ancienne résidence des rois du Dahomey, classée au patrimoine mondial de l’UNESCO.',
                  }}
                />
              )}
              {mega === 'evenements' && openMega === 'evenements' && eventCats.length > 0 && (
                <CatMegaMenu
                  categories={eventCats}
                  meta={EVENT_CAT_META}
                  basePath="/evenements"
                  featured={{
                    img: 'https://commons.wikimedia.org/wiki/Special:FilePath/10%20Janvier%202023,%20F%C3%AAte%20de%20vodoun%20%C3%A0%20Ouidah%2033.jpg?width=500',
                    title: 'Festival Vodun Days',
                    text: 'Célébration annuelle des traditions vodun à Ouidah — cérémonies, danses et musiques rituelles.',
                  }}
                />
              )}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          <div className="navbar__search">
            <button
              className="navbar__icon-btn"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(o => !o)}
            >
              <Search size={18} />
            </button>
            {searchOpen && (
              <form className="navbar__search-panel" onSubmit={submitSearch}>
                <Search size={15} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher un site..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                />
              </form>
            )}
          </div>

          {isAuthenticated ? (
            <div className="navbar__user" onClick={() => setUserMenu(!userMenu)}>
              <div className="navbar__avatar">
                {user?.nom?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              <ChevronDown size={14} />
              {userMenu && (
                <div className="navbar__dropdown">
                  <Link to="/profil" onClick={() => setUserMenu(false)}>Mon profil</Link>
                  <Link to="/mes-reservations" onClick={() => setUserMenu(false)}>Mes réservations</Link>
                  <Link to="/circuits" onClick={() => setUserMenu(false)}>Mes circuits</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setUserMenu(false)}>Administration</Link>}
                  <button onClick={handleLogout}>Déconnexion</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/connexion" className="navbar__icon-btn" aria-label="Connexion">
                <User size={18} />
              </Link>
              <Link to="/inscription" className="navbar__btn-participez">Participez</Link>
            </>
          )}

          <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className="navbar__mobile-link"
              onClick={() => setMenuOpen(false)}>{label}</NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/profil" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Mon profil</Link>
              <Link to="/mes-reservations" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Mes réservations</Link>
              <Link to="/circuits" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Mes circuits</Link>
              {isAdmin && <Link to="/admin" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Administration</Link>}
            </>
          ) : (
            <Link to="/inscription" className="navbar__btn-participez navbar__btn-participez--mobile"
              onClick={() => setMenuOpen(false)}>Participez</Link>
          )}
        </div>
      )}
    </nav>
  )
}
