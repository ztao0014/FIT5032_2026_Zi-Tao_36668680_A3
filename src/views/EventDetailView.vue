<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import eventsData from '@/data/events.json'
import StarRating from '@/components/common/StarRating.vue'
import { useAuthStore } from '@/stores/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const event = ref(null)
const notFound = ref(false)

// Rating state
const userRating = ref(0)
const averageRating = ref(0)
const totalRatings = ref(0)
const isSubmittingRating = ref(false)

const canBook = computed(() => event.value && event.value.spotsLeft > 0)
const isLoggedIn = computed(() => authStore.isAuthenticated)

onMounted(async () => {
  const id = route.params.id
  const found = eventsData.events.find(e => e.id === id)
  if (found) {
    event.value = found
    await loadRatings()
    if (isLoggedIn.value) {
      await loadUserRating()
    }
  } else {
    notFound.value = true
  }
})

async function loadRatings() {
  try {
    const q = query(collection(db, 'ratings'), where('itemId', '==', route.params.id), where('itemType', '==', 'event'))
    const snap = await getDocs(q)
    if (!snap.empty) {
      let sum = 0
      snap.forEach(doc => { sum += doc.data().score })
      totalRatings.value = snap.size
      averageRating.value = Math.round((sum / snap.size) * 10) / 10
    }
  } catch {
    // Firestore may not be connected yet — keep defaults
  }
}

async function loadUserRating() {
  if (!authStore.userId) return
  try {
    const ratingDoc = await getDoc(doc(db, 'ratings', authStore.userId + '_' + route.params.id))
    if (ratingDoc.exists()) {
      userRating.value = ratingDoc.data().score
    }
  } catch { /* ignore */ }
}

async function submitRating(score) {
  if (!isLoggedIn.value) {
    alert('Please log in to rate events.')
    router.push('/login')
    return
  }
  isSubmittingRating.value = true
  try {
    userRating.value = score
    await setDoc(doc(db, 'ratings', authStore.userId + '_' + route.params.id), {
      userId: authStore.userId,
      itemId: route.params.id,
      itemType: 'event',
      score: score,
      timestamp: new Date().toISOString(),
    })
    await loadRatings()
  } catch (err) {
    console.error('Rating submission failed:', err)
  } finally {
    isSubmittingRating.value = false
  }
}

function goToBooking() {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/events/' + route.params.id + '/book' } })
    return
  }
  router.push('/events/' + route.params.id + '/book')
}
</script>

<template>
  <div class="container py-5">
    <div v-if="notFound" class="text-center py-5">
      <h1>Event Not Found</h1>
      <p class="text-muted">This event does not exist or has been removed.</p>
      <router-link to="/events" class="btn btn-primary">← Back to Events</router-link>
    </div>

    <template v-if="event">
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><router-link to="/events">Events</router-link></li>
          <li class="breadcrumb-item active" aria-current="page">{{ event.title }}</li>
        </ol>
      </nav>

      <div class="row">
        <div class="col-lg-8">
          <span class="badge bg-sb-blue mb-2">{{ event.category }}</span>
          <h1>{{ event.title }}</h1>

          <!-- Star Rating -->
          <div class="d-flex align-items-center gap-3 my-3">
            <StarRating
              :model-value="averageRating"
              :readonly="true"
              :star-size="'1.8rem'"
            />
            <span class="text-muted">
              <strong>{{ averageRating || 'No ratings yet' }}</strong>
              <span v-if="totalRatings > 0"> ({{ totalRatings }} {{ totalRatings === 1 ? 'review' : 'reviews' }})</span>
            </span>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-body p-4">
              <p class="text-large">{{ event.description }}</p>
            </div>
          </div>

          <h3>Rate This Event</h3>
          <StarRating
            :model-value="userRating"
            :readonly="false"
            :star-size="'2rem'"
            :disabled="isSubmittingRating"
            @update:model-value="submitRating"
          />
          <p v-if="userRating > 0" class="text-success mt-1">
            ✓ Your rating: {{ userRating }}/5
          </p>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="card shadow-sm sticky-top" style="top: 100px;">
            <div class="card-body">
              <h3 class="h5">Event Details</h3>
              <ul class="list-unstyled">
                <li class="mb-2">🕐 <strong>Date:</strong> {{ event.date }}</li>
                <li class="mb-2">⏰ <strong>Time:</strong> {{ event.time }}</li>
                <li class="mb-2">📍 <strong>Location:</strong> {{ event.location }}</li>
                <li class="mb-2">👤 <strong>Instructor:</strong> {{ event.instructor }}</li>
                <li class="mb-2">💰 <strong>Cost:</strong> {{ event.price }}</li>
                <li class="mb-2">
                  <strong>Spots:</strong>
                  <span :class="event.spotsLeft > 0 ? 'text-success' : 'text-danger'">
                    {{ event.spotsLeft > 0 ? event.spotsLeft + ' remaining' : 'Fully booked' }}
                  </span>
                  / {{ event.capacity }}
                </li>
              </ul>
              <button
                class="btn btn-primary btn-lg w-100 mt-3"
                :disabled="!canBook"
                @click="goToBooking"
              >
                {{ canBook ? '📝 Book Now' : '🔒 Fully Booked' }}
              </button>
              <p v-if="!isLoggedIn" class="text-muted small text-center mt-2">
                You will need to log in to complete your booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
