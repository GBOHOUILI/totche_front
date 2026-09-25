import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, ArrowRight, Sparkles } from 'lucide-react'
import { sitesApi, evenementsApi, temoignagesApi } from '../../api/services'
import { SiteCard, EventCard, SectionHeader, Spinner } from '../../components/ui/index'
import { getImageUrl } from '../../api/helpers'

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
  const [temoignages, setTemoignages] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)

  useEffect(() => {
    Promise.all([sitesApi.list(), evenementsApi.list()])
      .then(([s, e]) => {
        setSites(s.data?.data || s.data || [])
        setEvents(e.data?.data || e.data || [])
      })
      .finally(() => setLoading(false))
    temoignagesApi.list().then(r => setTemoignages(r.data || [])).catch(() => {})
  }, [])

  // Hero carousel
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const featuredSites = sites.slice(0, 6)
  const featuredEvents = events.slice(0, 5)

  return (
    <div className="home">
      {/* ── HERO - image plein cadre, texte minimal centré, scroll discret ── */}
      <section className="hero">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={i}
            className={`hero__bg${i === heroIdx ? ' hero__bg--active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="hero__overlay" />

        <div className="hero__content">
          <h1>Le Bénin, à vivre pleinement</h1>
          <p>Sites historiques, réserves naturelles et festivals culturels - réservez directement, sans détour par une agence.</p>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <ChevronDown size={16} />
        </div>

        {/* Dots */}
        <div className="hero__dots">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} className={`hero__dot${i === heroIdx ? ' hero__dot--active' : ''}`} onClick={() => setHeroIdx(i)} />
          ))}
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
        <div className="cta-block cta-block--circuits">
          <Link to="/circuits">
            <span>Composez votre circuit</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CIRCUIT IA ── */}
      <section className="home__ai-promo">
        <div className="container">
          <span className="home__ai-promo-eyebrow"><Sparkles size={14} /> Nouveau</span>
          <h2>Composez votre circuit en discutant avec l'IA</h2>
          <p>
            Quelques questions - durée du séjour, budget, centres d'intérêt - et l'assistant
            vous propose un itinéraire sur mesure entre sites et événements, modifiable comme
            un circuit classique.
          </p>
          <Link to="/circuits#circuit-ia" className="btn btn--primary">
            Discuter avec l'assistant <ArrowRight size={16} />
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

      {/* ── IMMERSIF - deux photos en chevauchement + carte de contenu ── */}
      <section className="home__overlap">
        <div className="container home__overlap-inner">
          <div className="home__overlap-images">
            <img
              className="home__overlap-img home__overlap-img--back"
              src="https://commons.wikimedia.org/wiki/Special:FilePath/The%20village%20of%20Ganvi%C3%A9%20on%20Lake%20Nokou%C3%A9.jpg?width=700"
              alt="Cité lacustre de Ganvié"
            />
            <img
              className="home__overlap-img home__overlap-img--front"
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Plage%20de%20Grand-Popo%20(2).jpg?width=700"
              alt="Plage de Grand-Popo"
            />
          </div>
          <div className="home__overlap-card">
            <h2>Deux visages du Bénin</h2>
            <p>Des cases sur pilotis du lac Nokoué aux plages de sable fin bordées de cocotiers, chaque site raconte une facette différente du pays.</p>
            <Link to="/sites" className="btn btn--primary">
              Explorer les sites <ArrowRight size={16} />
            </Link>
          </div>
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

      {/* ── TÉMOIGNAGES ── */}
      {temoignages.length > 0 && (
        <section className="home__section">
          <div className="container">
            <SectionHeader title="Ce que pensent nos utilisateurs" />
            <div className="temoignages-grid">
              {temoignages.map(t => (
                <div key={t.id} className="temoignage-card">
                  <p className="temoignage-card__message">« {t.message} »</p>
                  <div className="temoignage-card__author">
                    {t.photo
                      ? <img src={getImageUrl(t.photo)} alt={t.nom} className="temoignage-card__avatar" />
                      : <div className="temoignage-card__avatar temoignage-card__avatar--placeholder">{t.nom.charAt(0)}</div>
                    }
                    <div>
                      <strong>{t.nom}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
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
