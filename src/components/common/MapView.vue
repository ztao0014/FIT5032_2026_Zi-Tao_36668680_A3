<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix marker icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  center: { type: Array, default: () => [-37.8142, 144.9637] }, // 200 Collins St, Melbourne
  zoom: { type: Number, default: 14 },
  height: { type: String, default: '400px' },
})

// State
const mapContainer = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const userLocation = ref(null)
const distanceToOffice = ref(null)
const routeInstructions = ref([])
const showRoute = ref(false)
const activeFeature = ref('nearby') // 'nearby' or 'directions'
const destinationAddress = ref('')

let map = null
let officeMarker = null
let userMarker = null
let routeLayer = null
let resultMarkers = []

// SilverBridge office location
const officeLatLng = [-37.8142, 144.9637]
const officeAddress = '200 Collins Street, Melbourne VIC 3000'

// Pre-defined nearby health services
const nearbyServices = [
  { name: 'Melbourne Medical Centre', type: 'GP Clinic', lat: -37.8121, lng: 144.9624, address: '160 Collins St, Melbourne', phone: '(03) 9650 0001' },
  { name: 'Collins Street Pharmacy', type: 'Pharmacy', lat: -37.8146, lng: 144.9658, address: '225 Collins St, Melbourne', phone: '(03) 9654 2002' },
  { name: 'St Vincent\'s Hospital Melbourne', type: 'Hospital', lat: -37.8060, lng: 144.9710, address: '41 Victoria Parade, Fitzroy', phone: '(03) 9231 2211' },
  { name: 'Melbourne City Medical Hub', type: 'Medical Centre', lat: -37.8108, lng: 144.9602, address: '380 Bourke St, Melbourne', phone: '(03) 9600 1234' },
  { name: 'CBD Physiotherapy & Rehab', type: 'Physiotherapy', lat: -37.8165, lng: 144.9590, address: '50 Lonsdale St, Melbourne', phone: '(03) 9650 7890' },
  { name: 'Royal Dental Hospital', type: 'Dental', lat: -37.8001, lng: 144.9665, address: '720 Swanston St, Carlton', phone: '(03) 9341 1000' },
]

const officeIcon = L.divIcon({
  html: '<div style="background:#2c5f8a;color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏥</div>',
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const userIcon = L.divIcon({
  html: '<div style="background:#e8913a;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function createServiceIcon(type) {
  const icons = { 'GP Clinic': '🏥', 'Pharmacy': '💊', 'Hospital': '🚑', 'Medical Centre': '🏥', 'Physiotherapy': '🏃', 'Dental': '🦷' }
  return L.divIcon({
    html: `<div style="background:#fff;color:#2c5f8a;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #2c5f8a;box-shadow:0 1px 4px rgba(0,0,0,0.2);">${icons[type] || '📍'}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function initMap() {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView(props.center, props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  // Office marker with popup
  officeMarker = L.marker(officeLatLng, { icon: officeIcon })
    .addTo(map)
    .bindPopup(`<strong>🏥 SilverBridge Health</strong><br>${officeAddress}<br>📞 1800-SILVER`, { maxWidth: 250 })

  // Invalidate size after container render
  setTimeout(() => map.invalidateSize(), 200)
}

// ---------- FEATURE 1: Search Nearby Health Services ----------
function searchNearbyServices() {
  clearResults()
  const q = searchQuery.value.toLowerCase().trim()

  let results
  if (q) {
    results = nearbyServices.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q),
    )
  } else {
    results = nearbyServices
  }

  searchResults.value = results

  // Place markers
  results.forEach(s => {
    const marker = L.marker([s.lat, s.lng], { icon: createServiceIcon(s.type) })
      .addTo(map)
      .bindPopup(`<strong>${s.name}</strong><br>${s.type}<br>${s.address}<br>📞 ${s.phone}`)
    resultMarkers.push(marker)
  })

  // Fit bounds
  if (results.length > 0) {
    const group = L.featureGroup(resultMarkers.concat(officeMarker))
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

function clearResults() {
  resultMarkers.forEach(m => map.removeLayer(m))
  resultMarkers = []
  searchResults.value = []
}

// ---------- FEATURE 2: Directions to Office ----------
function getUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.')
    return
  }
  isSearching.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      userLocation.value = [pos.coords.latitude, pos.coords.longitude]
      // Place user marker
      if (userMarker) map.removeLayer(userMarker)
      userMarker = L.marker(userLocation.value, { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>Your Location</strong>')
        .openPopup()

      // Reverse geocode to show address
      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        const revRes = await fetch(revUrl, { headers: { 'User-Agent': 'SilverBridgeHealth/1.0 (student-project)' } })
        const revData = await revRes.json()
        if (revData.display_name) {
          destinationAddress.value = revData.display_name
          userMarker.setPopupContent(`<strong>From:</strong> ${revData.display_name}`)
        }
      } catch (e) {
        // Reverse geocoding is optional, continue without it
      }

      // Automatically generate route to office
      await getRoute(userLocation.value, officeLatLng)
      showRoute.value = true

      // Fit both markers + route
      const group = L.featureGroup([userMarker, officeMarker])
      if (routeLayer) group.addLayer(routeLayer)
      map.fitBounds(group.getBounds().pad(0.15))

      isSearching.value = false
    },
    (err) => {
      console.error('Geolocation error:', err)
      alert('Could not get your location. Please allow location access or search by address instead.')
      isSearching.value = false
    },
    { enableHighAccuracy: true, timeout: 15000 },
  )
}

async function searchAddressAndRoute() {
  if (!destinationAddress.value.trim()) {
    alert('Please enter an address or street name.')
    return
  }

  isSearching.value = true
  try {
    // Auto-append Melbourne context if not present for better results
    let query = destinationAddress.value.trim()
    const lower = query.toLowerCase()
    if (!lower.includes('melbourne') && !lower.includes('victoria') && !lower.includes('vic')) {
      query += ', Melbourne, Australia'
    }

    // Use Nominatim for geocoding (free, uses OSM data)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&countrycodes=au`
    const response = await fetch(url, { headers: { 'User-Agent': 'SilverBridgeHealth/1.0 (student-project)' } })
    const data = await response.json()

    if (data.length === 0) {
      // Try without country filter as fallback
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3`
      const fallbackRes = await fetch(fallbackUrl, { headers: { 'User-Agent': 'SilverBridgeHealth/1.0 (student-project)' } })
      const fallbackData = await fallbackRes.json()
      if (fallbackData.length === 0) {
        alert(`Address "${destinationAddress.value}" not found. Try a nearby street name or suburb (e.g. "Bourke St" or "Carlton").`)
        isSearching.value = false
        return
      }
      data.push(...fallbackData)
    }

    const { lat, lon, display_name } = data[0]
    const destLatLng = [parseFloat(lat), parseFloat(lon)]

    // Place user marker at searched address
    if (userMarker) map.removeLayer(userMarker)
    userMarker = L.marker(destLatLng, { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>From:</strong> ${display_name}`)
      .openPopup()

    // Get route from OSRM
    await getRoute(destLatLng, officeLatLng)

    // Fit bounds
    const group = L.featureGroup([userMarker, officeMarker])
    if (routeLayer) group.addLayer(routeLayer)
    map.fitBounds(group.getBounds().pad(0.15))

    showRoute.value = true
  } catch (err) {
    console.error('Search failed:', err)
    alert('Could not connect to map service. Check your network or try again later.')
  } finally {
    isSearching.value = false
  }
}

async function getRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`
    const response = await fetch(url)
    const data = await response.json()

    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0]

      // Clear previous route
      if (routeLayer) map.removeLayer(routeLayer)

      // Draw route
      routeLayer = L.geoJSON(route.geometry, {
        style: { color: '#2c5f8a', weight: 4, opacity: 0.7 },
      }).addTo(map)

      // Extract instructions
      routeInstructions.value = route.legs[0].steps.map(s => ({
        instruction: s.maneuver?.modifier ? `${capitalize(s.maneuver.modifier)} — ${s.name || 'unnamed road'}` : (s.name || 'Continue'),
        distance: s.distance > 1000 ? `${(s.distance / 1000).toFixed(1)} km` : `${Math.round(s.distance)} m`,
      }))

      distanceToOffice.value = (route.legs[0].distance / 1000).toFixed(1)
    }
  } catch (err) {
    console.error('Routing failed:', err)
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function clearRoute() {
  if (userMarker) { map.removeLayer(userMarker); userMarker = null }
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null }
  routeInstructions.value = []
  distanceToOffice.value = null
  showRoute.value = false
  userLocation.value = null
  destinationAddress.value = ''
}

// Switch between feature panels
function switchFeature(feature) {
  activeFeature.value = feature
}

// Watch for container resizes
onMounted(() => {
  setTimeout(initMap, 100)
})

onBeforeUnmount(() => {
  if (map) { map.remove(); map = null }
})
</script>

<template>
  <div class="map-view">
    <!-- Feature Tabs -->
    <div class="d-flex gap-2 mb-3 flex-wrap">
      <button
        class="btn btn-sm"
        :class="activeFeature === 'nearby' ? 'btn-primary' : 'btn-outline-primary'"
        @click="switchFeature('nearby')"
      >
        🔍 {{ $t ? '' : '' }}Nearby Health Services
      </button>
      <button
        class="btn btn-sm"
        :class="activeFeature === 'directions' ? 'btn-primary' : 'btn-outline-primary'"
        @click="switchFeature('directions')"
      >
        🧭 {{ $t ? '' : '' }}Directions to Office
      </button>
    </div>

    <!-- Feature 1: Nearby Health Services -->
    <div v-if="activeFeature === 'nearby'" class="card mb-3 bg-light">
      <div class="card-body py-2">
        <div class="input-group input-group-sm">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search hospitals, pharmacies, clinics..."
            aria-label="Search nearby health services"
            @keyup.enter="searchNearbyServices"
          />
          <button class="btn btn-primary" @click="searchNearbyServices">🔍 Search</button>
          <button class="btn btn-outline-secondary" @click="clearResults">✕ Clear</button>
        </div>
      </div>
    </div>

    <!-- Feature 2: Directions to Office -->
    <div v-if="activeFeature === 'directions'" class="card mb-3 bg-light">
      <div class="card-body py-2">
        <p class="small text-muted mb-2">
          <strong>🧭 Find your way to SilverBridge Health</strong><br />
          Enter your address or use your current location to get directions and distance.
        </p>
        <div class="d-flex gap-2 flex-wrap">
          <input
            v-model="destinationAddress"
            type="text"
            class="form-control form-control-sm"
            placeholder="Enter your address..."
            aria-label="Enter your starting address"
            style="flex: 1; min-width: 200px;"
          />
          <button class="btn btn-primary btn-sm" @click="searchAddressAndRoute" :disabled="isSearching">
            {{ isSearching ? 'Searching...' : '🧭 Get Route' }}
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="getUserLocation" :disabled="isSearching">
            📍 Use My Location
          </button>
          <button v-if="showRoute" class="btn btn-outline-danger btn-sm" @click="clearRoute">✕ Clear</button>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="map-container"
      :style="{ height: height, borderRadius: '12px' }"
      aria-label="Interactive map showing health services and office location"
      role="application"
    ></div>

    <!-- Info Panel -->
    <div v-if="activeFeature === 'nearby' && searchResults.length > 0" class="mt-3">
      <h6 class="mb-2">📍 Found {{ searchResults.length }} Service(s) Near Our Office</h6>
      <div class="row g-2">
        <div class="col-md-6" v-for="s in searchResults" :key="s.name">
          <div class="card p-2">
            <strong>{{ s.name }}</strong>
            <span class="badge bg-sb-blue ms-2">{{ s.type }}</span>
            <div class="small text-muted mt-1">{{ s.address }}</div>
            <div class="small">📞 {{ s.phone }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Info Panel -->
    <div v-if="activeFeature === 'directions' && showRoute" class="mt-3">
      <div class="card bg-light">
        <div class="card-body">
          <h6 class="mb-2">
            🧭 Directions to SilverBridge Health
            <span v-if="distanceToOffice" class="text-primary fw-bold ms-2">(~{{ distanceToOffice }} km)</span>
          </h6>
          <div v-if="routeInstructions.length > 0" class="small">
            <div class="mb-1" v-for="(step, idx) in routeInstructions" :key="idx">
              <strong>{{ idx + 1 }}.</strong> {{ step.instruction }}
              <span class="text-muted">({{ step.distance }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  min-height: 300px;
  border: 2px solid #dee2e6;
  z-index: 1;
}
</style>
