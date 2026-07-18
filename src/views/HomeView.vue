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
    description: 'Browse and book community activities near you. From gentle yoga to digital skills workshops — all free or low cost.',
    link: '/events',
    linkText: 'Browse Events',
  },
  {
    icon: '🆘',
    title: 'Get Urgent Support',
    description: 'Need help right now? One tap connects you directly to our support coordinator. Available 24 hours, 7 days a week.',
    link: '/get-support',
    linkText: 'Get Help Now',
  },
  {
    icon: '📚',
    title: 'Health Resources',
    description: 'Expert-reviewed health guides in large, easy-to-read print. Plain language explanations you can actually understand.',
    link: '/health-resources',
    linkText: 'Explore Resources',
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

function getDay(dateStr) {
  return new Date(dateStr).getDate()
}
function getMonth(dateStr) {
  return new Date(dateStr).toLocaleString('en-AU', { month: 'short' })
}
</script>

<template>
  <!-- Hero Section -->
  <section class="hero-section text-center">
    <div class="container py-5">
      <h1 class="display-3 fw-bold mb-3 reveal">
        Welcome to SilverBridge Health
      </h1>
      <p class="lead mb-4 reveal" style="max-width: 700px; margin-left: auto; margin-right: auto;">
        Supporting the physical and mental wellbeing of older Australians.
        Find activities, access health information, and connect with support — all in one place.
      </p>
      <div class="d-flex justify-content-center gap-3 flex-wrap reveal">
        <router-link to="/events" class="btn btn-warning btn-lg px-4 fw-bold shadow">
          📅 Find Events Near You
        </router-link>
        <router-link to="/get-support" class="btn btn-danger btn-lg px-4 fw-bold shadow">
          🆘 Urgent Help
        </router-link>
      </div>
    </div>
  </section>

  <!-- Feature Cards -->
  <section class="py-5" aria-labelledby="features-heading">
    <div class="container">
      <h2 id="features-heading" class="text-center mb-2 reveal">How Can We Help You?</h2>
      <p class="text-center text-muted mb-5 reveal">Three simple ways to get started</p>
      <div class="row g-4">
        <div class="col-lg-4 col-md-6" v-for="(feature, i) in features" :key="feature.title">
          <div class="card h-100 reveal" :style="{ transitionDelay: (i * 0.1) + 's' }">
            <div class="card-body d-flex flex-column text-center p-4">
              <div class="mb-3" style="font-size: 3.5rem;">{{ feature.icon }}</div>
              <h3 class="card-title h4 mb-3">{{ feature.title }}</h3>
              <p class="card-text flex-grow-1 mb-4">{{ feature.description }}</p>
              <router-link
                :to="feature.link"
                class="btn btn-primary btn-lg align-self-center"
              >
                {{ feature.linkText }} →
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
      <h2 id="upcoming-heading" class="mb-4 reveal">📅 Upcoming Community Events</h2>
      <div class="row g-4">
        <div class="col-lg-4 col-md-6" v-for="(event, i) in events" :key="event.id">
          <div class="card h-100 reveal" :style="{ transitionDelay: (i * 0.1) + 's' }">
            <div class="card-body p-4">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="event-date-badge flex-shrink-0">
                  <span class="day">{{ getDay(event.date) }}</span>
                  <span class="month">{{ getMonth(event.date) }}</span>
                </div>
                <div>
                  <span class="badge rounded-pill mb-1" style="background: var(--sb-primary);">{{ event.category }}</span>
                  <h3 class="card-title h5 mb-1">{{ event.title }}</h3>
                </div>
              </div>
              <p class="card-text text-muted small mb-2">
                ⏰ {{ event.time }} &nbsp;|&nbsp; 👤 {{ event.instructor }}
              </p>
              <p class="card-text small mb-3">📍 {{ event.location }}</p>
              <p class="card-text">{{ event.description.substring(0, 100) }}...</p>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center px-4 py-3">
              <span class="badge rounded-pill fs-6"
                :class="event.spotsLeft > 0 ? 'bg-success' : 'bg-danger'"
                :style="event.spotsLeft > 0 ? '' : ''">
                {{ event.spotsLeft > 0 ? event.spotsLeft + ' spots left' : 'Fully booked' }}
              </span>
              <button
                class="btn btn-primary btn-sm"
                @click="viewEvent(event.id)"
                :disabled="event.spotsLeft === 0"
              >
                {{ event.spotsLeft > 0 ? 'View Details →' : 'Join Waitlist' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-5 reveal">
        <router-link to="/events" class="btn btn-outline-primary btn-lg px-5">
          View All Events →
        </router-link>
      </div>
    </div>
  </section>

  <!-- Quick Access: Caregivers -->
  <section class="py-5" aria-labelledby="caregivers-heading">
    <div class="container reveal">
      <div class="card border-0 shadow text-white p-4"
        style="background: linear-gradient(135deg, var(--sb-primary), var(--sb-primary-dark));">
        <div class="card-body text-center py-4">
          <h2 id="caregivers-heading" class="mb-2">👨‍👩‍👦 Caring for Someone?</h2>
          <p class="lead mb-4" style="opacity: 0.9;">
            Quick access to subsidy applications, referral tracking, and printable care resources.
          </p>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <router-link to="/caregivers" class="btn btn-warning btn-lg fw-bold">Apply for Subsidies</router-link>
            <router-link to="/caregivers" class="btn btn-outline-light btn-lg fw-bold">Track Referrals</router-link>
            <router-link to="/caregivers" class="btn btn-outline-light btn-lg fw-bold">Download Resources</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
