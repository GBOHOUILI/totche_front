import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Marqueur numéroté custom (DivIcon en SVG inline) plutôt que les icônes PNG par
// défaut de Leaflet, dont les chemins cassent avec les bundlers (gotcha connu) -
// évite d'avoir à copier des assets, et reste cohérent avec le style de l'app.
function numberedIcon(n, reservee) {
  const bg = reservee ? 'var(--success, #1E7A46)' : 'var(--red, #E63946)'
  return L.divIcon({
    className: 'circuit-map__marker',
    html: `<span style="background:${bg}">${n}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })
}

// Recentre/zoome automatiquement sur les points à chaque changement d'étapes.
function FitBounds({ points }) {
  const map = useMap()
  useMemo(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 13)
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)])
  return null
}

// etapes : [{ id, ordre, libelle, adresse, latitude, longitude, reservee }]
// Étapes sans coordonnées valides simplement ignorées (jamais de crash sur une
// donnée manquante - un site/événement de démo peut ne pas avoir de lat/lng).
export default function CircuitMap({ etapes = [], height = 360 }) {
  const points = etapes
    .map(e => ({ ...e, lat: parseFloat(e.latitude), lng: parseFloat(e.longitude) }))
    .filter(e => Number.isFinite(e.lat) && Number.isFinite(e.lng))

  if (points.length === 0) {
    return (
      <div className="circuit-map circuit-map--empty" style={{ height }}>
        <p>Aucune étape géolocalisée à afficher pour l'instant.</p>
      </div>
    )
  }

  const latlngs = points.map(p => [p.lat, p.lng])

  return (
    <div className="circuit-map" style={{ height }}>
      <MapContainer center={latlngs[0]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latlngs.length > 1 && (
          <Polyline positions={latlngs} pathOptions={{ color: 'var(--red, #E63946)', weight: 3, dashArray: '6 8' }} />
        )}
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={numberedIcon(p.ordre, p.reservee)}>
            <Popup>
              <strong>{p.ordre}. {p.libelle}</strong>
              {p.adresse && <div>{p.adresse}</div>}
            </Popup>
          </Marker>
        ))}
        <FitBounds points={latlngs} />
      </MapContainer>
    </div>
  )
}
