import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'

// Pin simple (DivIcon SVG inline, comme CircuitMap.jsx - évite le gotcha des
// icônes PNG par défaut de Leaflet cassées par les bundlers, pas de nouvel
// asset à gérer).
const pinIcon = L.divIcon({
  className: 'location-picker__marker',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

// Bénin, vue d'ensemble - centre par défaut si aucune coordonnée existante.
const BENIN_CENTER = [9.3, 2.3]
const BENIN_ZOOM = 7

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Recentre la carte quand latitude/longitude changent depuis l'extérieur
// (lien Google Maps collé, ou modification manuelle des champs) - un clic
// sur la carte se recentre déjà visuellement de lui-même, ce composant
// couvre les deux autres sources de changement.
function RecenterOnChange({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])
  return null
}

// Motifs de liens Google Maps supportés : .../@lat,lng,zoom, ?q=lat,lng,
// ?ll=lat,lng. Les liens raccourcis (maps.app.goo.gl/...) ne sont pas
// résolubles côté client sans clé API Google payante - message d'erreur
// clair dans ce cas plutôt qu'un crash silencieux.
function parseGoogleMapsLink(url) {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  }
  return null
}

export default function LocationPicker({ latitude, longitude, onChange }) {
  const [linkValue, setLinkValue] = useState('')

  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  const hasPosition = Number.isFinite(lat) && Number.isFinite(lng)
  const center = hasPosition ? [lat, lng] : BENIN_CENTER
  const zoom = hasPosition ? 14 : BENIN_ZOOM

  const handlePick = (newLat, newLng) => {
    onChange({ latitude: newLat, longitude: newLng })
  }

  const handleLinkSubmit = (e) => {
    e.preventDefault()
    if (!linkValue.trim()) return
    const coords = parseGoogleMapsLink(linkValue)
    if (!coords) {
      toast.error("Lien non reconnu (les liens raccourcis type maps.app.goo.gl ne sont pas supportés) - utilisez la carte ci-dessous.")
      return
    }
    handlePick(coords.lat, coords.lng)
    setLinkValue('')
    toast.success('Position récupérée depuis le lien.')
  }

  return (
    <div className="location-picker">
      <form className="location-picker__link" onSubmit={handleLinkSubmit}>
        <input
          type="text"
          value={linkValue}
          onChange={e => setLinkValue(e.target.value)}
          placeholder="Coller un lien Google Maps (facultatif)"
        />
        <button type="submit" className="btn btn--ghost btn--sm">Utiliser</button>
      </form>

      <div className="location-picker__map">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasPosition && <Marker position={[lat, lng]} icon={pinIcon} />}
          <ClickHandler onPick={handlePick} />
          <RecenterOnChange lat={lat} lng={lng} />
        </MapContainer>
      </div>

      <div className="location-picker__coords">
        <div className="admin-form__field">
          <label>Latitude *</label>
          <input
            type="number" step="any" required
            value={latitude}
            onChange={e => onChange({ latitude: e.target.value, longitude })}
          />
        </div>
        <div className="admin-form__field">
          <label>Longitude *</label>
          <input
            type="number" step="any" required
            value={longitude}
            onChange={e => onChange({ latitude, longitude: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
