import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, Users, ChevronRight, ArrowRight } from 'lucide-react'
import { sitesApi, evenementsApi } from '../../api/services'
import { SiteCard, EventCard, SectionHeader, Spinner } from '../../components/ui/index'

import hero1 from '../../assets/images/PNG image 21.png'
import hero2 from '../../assets/images/PNG image 27.png'
import hero3 from '../../assets/images/PNG image 17.png'
import hero4 from '../../assets/images/PNG image 15.png'


const HERO_IMAGES = [
    hero2,
    hero4,
  'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1600&q=80',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80',
    hero2,
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80',
  hero1,
  hero2,
  hero3,
]

export default function Home() {
  const [sites, setSites] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const [search, setSearch] = useState({ where: '', when: '', persons: '' })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([sitesApi.list(), evenementsApi.list()])
      .then(([s, e]) => {
        setSites(s.data?.data || s.data || [])
        setEvents(e.data?.data || e.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  // Hero carousel
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/sites?q=${search.where}`)
  }

  const featuredSites = sites.slice(0, 6)
  const featuredEvents = events.slice(0, 5)

  return (
    <div className="home">
      {/* ── HERO — image plein cadre, aucun contenu superposé ── */}
      <section className="hero">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={i}
            className={`hero__bg${i === heroIdx ? ' hero__bg--active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="hero__overlay" />

        {/* Dots */}
        <div className="hero__dots">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} className={`hero__dot${i === heroIdx ? ' hero__dot--active' : ''}`} onClick={() => setHeroIdx(i)} />
          ))}
        </div>
      </section>

      {/* ── INTRO ÉDITORIALE — titre + recherche, sur fond blanc ── */}
      <section className="hero__intro">
        <div className="container hero__intro-grid">
          <div>
            <h1>Programmez votre prochaine escapade au Bénin</h1>
            <p className="hero__intro-sub" style={{ marginTop: '1rem' }}>
              Sites historiques, réserves naturelles et festivals culturels — réservez directement, sans détour par une agence.
            </p>
          </div>
          <form className="hero__search" onSubmit={handleSearch}>
            <div className="hero__search-field">
              <MapPin size={16} />
              <input
                type="text"
                placeholder="Où visitez-vous ?"
                value={search.where}
                onChange={e => setSearch(s => ({ ...s, where: e.target.value }))}
              />
            </div>
            <div className="hero__search-field">
              <Calendar size={16} />
              <input
                type="date"
                placeholder="Quand ?"
                value={search.when}
                onChange={e => setSearch(s => ({ ...s, when: e.target.value }))}
              />
            </div>
            <button type="submit" className="hero__search-btn">
              <Search size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* ── CTA BLOCKS ── */}
      <section className="home__cta-blocks">
        <div className="cta-block cta-block--sites">
          <img src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=70" alt="" />
          <Link to="/sites">
            <span>Sites Touristiques</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="cta-block cta-block--events">
          <div className="cta-block__vodun" />
          <Link to="/evenements">
            <span>Évènements</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="cta-block cta-block--hotels">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70" alt="" />
          <Link to="/hotels">
            <span>Hôtels & Restaurants</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── SITES TOURISTIQUES ── */}
      <section className="home__section">
        <div className="container">
          <SectionHeader
            title="Nos Sites Touristiques"
            action={<Link to="/sites" className="btn-link">Voir plus <ChevronRight size={16} /></Link>}
          />
          {loading ? (
            <div className="center-spinner"><Spinner /></div>
          ) : (
            <div className="cards-grid cards-grid--5 cards-grid--home">
              {featuredSites.map((site, i) => <SiteCard key={site.id} site={site} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── ÉVÉNEMENTS ── */}
      <section className="home__section home__section--dark">
        <div className="container">
          <SectionHeader
            title="Évènements"
            action={<Link to="/evenements" className="btn-link btn-link--light">Voir plus <ChevronRight size={16} /></Link>}
          />
          {loading ? (
            <div className="center-spinner"><Spinner /></div>
          ) : (
            <div className="cards-grid cards-grid--5 cards-grid--home">
              {featuredEvents.map((evt, i) => <EventCard key={evt.id} event={evt} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED SITE (Temple des Pythons style) ── */}
      {sites[0] && (
        <section className="home__featured">
          <div className="container home__featured-inner">
            <div className="home__featured-text">
              <h2>{sites[0].libelle}</h2>
              <p>{sites[0].description?.slice(0, 400)}…</p>
              <Link to={`/sites/${sites[0].id}`} className="btn btn--primary">
                Découvrir <ArrowRight size={16} />
              </Link>
            </div>
            <div className="home__featured-img">
              {sites[0].galeries?.[0]?.url_fichier
                ? <img src={sites[0].galeries[0].url_fichier} alt={sites[0].libelle} />
                : <div className="home__featured-placeholder" />
              }
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="home__faq">
        <div className="container">
          <h2>FAQ</h2>
          {[
            { q: 'Comment réserver un site touristique ?', a: 'Créez un compte, sélectionnez le site souhaité et cliquez sur "Réservation".' },
            { q: 'Les réservations sont-elles remboursables ?', a: 'Les conditions d\'annulation varient selon les sites. Consultez les détails lors de la réservation.' },
            { q: 'Comment accéder à mon ticket après paiement ?', a: 'Votre ticket est disponible dans votre espace personnel sous "Mes réservations".' },
          ].map((faq, i) => (
            <FaqItem key={i} {...faq} />
          ))}
        </div>
      </section>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' faq-item--open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-item__q">
        <span>{q}</span>
        <ChevronRight size={16} className="faq-item__icon" />
      </div>
      {open && <p className="faq-item__a">{a}</p>}
    </div>
  )
}
