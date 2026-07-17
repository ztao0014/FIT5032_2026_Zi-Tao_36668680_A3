<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import eventsData from '@/data/events.json'

const router = useRouter()
const events = ref([])

const features = [
  {
    icon: '📅',
    title: 'Find Local Events',
    description: 'Browse and book community activities near you. From gentle yoga to digital skills workshops.',
    link: '/events',
    linkText: 'Browse Events →',
  },
  {
    icon: '🆘',
    title: 'Get Urgent Support',
    description: 'One-tap connection to our support coordinator. We are here when you need us most.',
    link: '/get-support',
    linkText: 'Get Help Now →',
  },
  {
    icon: '📚',
    title: 'Health Resources',
    description: 'Expert-reviewed health guides in large, easy-to-read print. Simple explanations you can trust.',
    link: '/health-resources',
    linkText: 'Explore Resources →',
  },
]

onMounted(() => {
  try {
    const now = new Date()
    events.value = eventsData.events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
  } catch {
    events.value = []
  }
})

function viewEvent(id) {
  router.push('/events/' + id)
}
</script>

<template>
  <!-- Hero Section -->
  <section class="bg-sb-blue text-white py-5">
    <div class="container text-center py-4">
      <h1 class="display-4 fw-bold mb-3">Welcome to SilverBridge Health</h1>
      <p class="lead mb-4" style="font-size: calc(1.4rem * var(--font-scale));">
        Connecting seniors, caregivers, and community support — all in one place.
      </p>
      <div class="d-flex justify-content-center gap-3 flex-wrap">
        <router-link to="/events" class="btn btn-warning btn-lg px-4 fw-bold">
          📅 Find Events
        </router-link>
        <router-link to="/get-support" class="btn btn-danger btn-lg px-4 fw-bold">
          🆘 Urgent Help
        </router-link>
      </div>
    </div>
  </section>

  <!-- Feature Cards -->
  <section class="py-5" aria-labelledby="features-heading">
    <div class="container">
      <h2 id="features-heading" class="text-center mb-4">How Can We Help You?</h2>
      <div class="row g-4">
        <div class="col-lg-4 col-md-6" v-for="feature in features" :key="feature.title">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="text-center mb-3" style="font-size: 3rem;">{{ feature.icon }}</div>
              <h3 class="card-title h4 text-center">{{ feature.title }}</h3>
              <p class="card-text flex-grow-1">{{ feature.description }}</p>
              <router-link :to="feature.link" class="btn btn-outline-primary mt-2 align-self-center">
                {{ feature.linkText }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Upcoming Events -->
  <section class="py-5 bg-light" aria-labelledby="upcoming-heading" v-if="events.length > 0">
    <div class="container">
      <h2 id="upcoming-heading" class="mb-4">📅 Upcoming Events</h2>
      <div class="row g-4">
        <div class="col-lg-4 col-md-6" v-for="event in events" :key="event.id">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-sb-blue mb-2">{{ event.category }}</span>
              <h3 class="card-title h5">{{ event.title }}</h3>
              <p class="card-text text-muted small">
                📍 {{ event.location }}<br />
                🕐 {{ event.date }} at {{ event.time }}<br />
                👤 {{ event.instructor }}
              </p>
              <p class="card-text">{{ event.description.substring(0, 100) }}...</p>
            </div>
            <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
              <span class="badge fs-6" :class="event.spotsLeft > 0 ? 'bg-success' : 'bg-danger'">
                {{ event.spotsLeft > 0 ? event.spotsLeft + ' spots left' : 'Fully booked' }}
              </span>
              <button class="btn btn-primary btn-sm" @click="viewEvent(event.id)" :disabled="event.spotsLeft === 0">
                {{ event.spotsLeft > 0 ? 'View Details' : 'Join Waitlist' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <router-link to="/events" class="btn btn-outline-primary btn-lg">View All Events →</router-link>
      </div>
    </div>
  </section>

  <!-- Quick Access: Caregivers -->
  <section class="py-5" aria-labelledby="caregivers-heading">
    <div class="container">
      <div class="card bg-sb-blue text-white shadow">
        <div class="card-body text-center py-4">
          <h2 id="caregivers-heading" class="mb-3">👨‍👩‍👦 For Caregivers</h2>
          <p class="lead mb-4">
            Quick access to subsidy applications, referral tracking, and printable care resources.
          </p>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <router-link to="/caregivers" class="btn btn-warning fw-bold">Apply for Subsidies</router-link>
            <router-link to="/caregivers" class="btn btn-outline-light fw-bold">Track Referral Status</router-link>
            <router-link to="/caregivers" class="btn btn-outline-light fw-bold">Download Resources</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
