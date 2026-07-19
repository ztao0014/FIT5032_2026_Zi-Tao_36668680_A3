<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import eventsData from '@/data/events.json'

const router = useRouter()
const events = ref([])
const searchQuery = ref('')
const selectedCategory = ref('All')
const loading = ref(true)

const categories = computed(() => {
  const cats = ['All', ...new Set(events.value.map(e => e.category))]
  return cats
})

const filteredEvents = computed(() => {
  let result = events.value
  if (selectedCategory.value !== 'All') {
    result = result.filter(e => e.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
  }
  return result
})

// Re-observe cards after filtering for scroll-reveal animation
let revealObserver = null

watch([filteredEvents, selectedCategory, searchQuery], async () => {
  await nextTick()
  if (revealObserver) revealObserver.disconnect()
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el))
})

onMounted(() => {
  try {
    events.value = eventsData.events.sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch {
    events.value = []
  }
  loading.value = false
})

function viewEvent(id) {
  router.push('/events/' + id)
}
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-3">📅 Community Events</h1>
    <p class="lead text-muted mb-4">Browse online and offline activities. Simple registration — no printing required.</p>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading events...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="text-center py-5">
      <p class="text-muted">No events are currently scheduled. Check back soon for upcoming activities.</p>
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-6 mb-3 mb-md-0">
          <label for="search-events" class="form-label fw-bold">🔍 Search Events</label>
          <input
            id="search-events"
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search by name or location..."
          />
        </div>
        <div class="col-md-6">
          <label for="category-filter-events" class="form-label fw-bold">📂 Filter by Category</label>
          <select id="category-filter-events" v-model="selectedCategory" class="form-select">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredEvents.length === 0" class="text-center py-5">
        <p class="text-muted">No events match your search. Try different keywords.</p>
      </div>

      <!-- Event Cards -->
      <div class="row g-4">
        <div class="col-lg-6 col-xl-4" v-for="(event, i) in filteredEvents" :key="event.id">
          <div class="card h-100 reveal" :style="{ transitionDelay: (i % 6) * 0.08 + 's' }">
            <div class="card-body p-4">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="event-date-badge flex-shrink-0">
                  <span class="day">{{ new Date(event.date).getDate() }}</span>
                  <span class="month">{{ new Date(event.date).toLocaleString('en-AU', { month: 'short' }) }}</span>
                </div>
                <div>
                  <span class="badge rounded-pill mb-1" style="background: var(--sb-primary);">{{ event.category }}</span>
                  <h2 class="card-title h5 mb-1">{{ event.title }}</h2>
                </div>
              </div>
              <p class="card-text text-muted small mb-1">
                ⏰ {{ event.time }}
              </p>
              <p class="card-text small mb-2">
                📍 {{ event.location }}
              </p>
              <p class="card-text small">
                👤 {{ event.instructor }} &nbsp;|&nbsp; 💰 {{ event.price }}
              </p>
              <p class="card-text mt-2">{{ event.description.substring(0, 120) }}...</p>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center px-4 py-3">
              <span class="badge rounded-pill fs-6"
                :class="event.spotsLeft > 0 ? 'bg-success' : 'bg-danger'">
                {{ event.spotsLeft > 0 ? event.spotsLeft + ' spots left' : 'Fully booked' }}
              </span>
              <button class="btn btn-primary btn-sm" @click="viewEvent(event.id)">
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
