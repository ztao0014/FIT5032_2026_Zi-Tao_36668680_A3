<script setup>
import { ref, computed, onMounted } from 'vue'
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
        <div class="col-lg-6 col-xl-4" v-for="event in filteredEvents" :key="event.id">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-sb-blue mb-2">{{ event.category }}</span>
              <h2 class="card-title h5">{{ event.title }}</h2>
              <p class="card-text text-muted small">
                🕐 <strong>{{ event.date }}</strong> | {{ event.time }}<br />
                📍 {{ event.location }}<br />
                👤 {{ event.instructor }}<br />
                💰 {{ event.price }}
              </p>
              <p class="card-text">{{ event.description.substring(0, 120) }}...</p>
            </div>
            <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
              <span class="badge fs-6" :class="event.spotsLeft > 0 ? 'bg-success' : 'bg-danger'">
                {{ event.spotsLeft > 0 ? event.spotsLeft + ' left' : 'Full' }}
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
