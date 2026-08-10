<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import eventsData from '@/data/events.json'
import { useAuthStore } from '@/stores/auth'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { sendBookingConfirmation } from '@/services/emailService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const event = ref(null)
const currentStep = ref(1)
const totalSteps = 3
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const formErrors = ref({})

// Form fields
const form = ref({
  participantName: '',
  participantPhone: '',
  participantEmail: '',
  participants: 1,
  specialRequirements: '',
  emergencyContact: '',
  emergencyPhone: '',
})

// Validation rules
const validations = {
  participantName: {
    required: true,
    message: 'Full name is required.',
  },
  participantPhone: {
    required: true,
    pattern: /^04\d{8}$/,
    message: 'Please enter a valid Australian mobile number (e.g. 0412 345 678).',
  },
  participantEmail: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address.',
  },
  participants: {
    required: true,
    min: 1,
    max: 5,
    message: 'Number of participants must be 1–5.',
  },
  emergencyContact: {
    required: true,
    message: 'Emergency contact name is required.',
  },
  emergencyPhone: {
    required: true,
    pattern: /^04\d{8}$/,
    message: 'Please enter a valid Australian mobile number.',
  },
}

onMounted(() => {
  const id = route.params.id
  const found = eventsData.events.find(e => e.id === id)
  if (found) {
    event.value = found
    form.value.participantEmail = authStore.user?.email || ''
  } else {
    router.push('/events')
  }
})

function validateField(fieldName) {
  const rules = validations[fieldName]
  if (!rules) return ''

  const value = form.value[fieldName]

  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rules.message
  }
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.message
  }
  if (rules.min !== undefined && value < rules.min) {
    return rules.message
  }
  if (rules.max !== undefined && value > rules.max) {
    return rules.message
  }
  return ''
}

function validateStep(step) {
  const errors = {}
  if (step === 1) {
    const fields = ['participantName', 'participantPhone', 'participantEmail']
    fields.forEach(f => {
      const err = validateField(f)
      if (err) errors[f] = err
    })
  } else if (step === 2) {
    const err = validateField('participants')
    if (err) errors.participants = err
  } else if (step === 3) {
    const fields = ['emergencyContact', 'emergencyPhone']
    fields.forEach(f => {
      const err = validateField(f)
      if (err) errors[f] = err
    })
  }
  return errors
}

function nextStep() {
  const errors = validateStep(currentStep.value)
  if (Object.keys(errors).length > 0) {
    formErrors.value = errors
    return
  }
  formErrors.value = {}
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    formErrors.value = {}
  }
}

async function submitBooking() {
  const errors = validateStep(currentStep.value)
  if (Object.keys(errors).length > 0) {
    formErrors.value = errors
    return
  }

  // Guard against expired session
  if (!authStore.userId) {
    alert('Your session has expired. Please log in again.')
    router.push('/login')
    return
  }

  isSubmitting.value = true
  try {
    await addDoc(collection(db, 'bookings'), {
      eventId: event.value.id,
      eventTitle: event.value.title,
      userId: authStore.userId,
      ...form.value,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    })
    submitSuccess.value = true
	    // Send confirmation email (fire-and-forget; booking is saved regardless)
	    sendBookingConfirmation({
	      participantName: form.value.participantName,
	      participantEmail: form.value.participantEmail,
	      eventTitle: event.value.title,
	      eventDate: event.value.date || '',
	    }).catch(() => { /* email is non-critical */ })
  } catch (err) {
    console.error('Booking failed:', err)
    alert('Booking failed. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const stepLabels = ['Your Details', 'Participants', 'Emergency Contact']
</script>

<template>
  <div class="container py-5">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><router-link to="/events">Events</router-link></li>
        <li class="breadcrumb-item">
          <router-link :to="'/events/' + (event?.id || '')">{{ event?.title || 'Event' }}</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Book</li>
      </ol>
    </nav>

    <template v-if="event">
      <h1>📝 Book: {{ event.title }}</h1>
      <p class="text-muted">{{ event.date }} | {{ event.time }}</p>

      <!-- Success -->
      <div v-if="submitSuccess" class="text-center py-5">
        <div style="font-size: 4rem;">✅</div>
        <h2 class="text-success">Booking Confirmed!</h2>
        <p class="lead">Thank you for booking <strong>{{ event.title }}</strong>.</p>
        <p>A confirmation email will be sent to {{ form.participantEmail || 'your email address' }}.</p>
        <router-link to="/events" class="btn btn-primary btn-lg">← Back to Events</router-link>
      </div>

      <!-- Booking Form -->
      <template v-else>
        <!-- Step Indicator -->
        <div class="d-flex justify-content-center mb-4">
          <div
            v-for="(label, idx) in stepLabels"
            :key="idx"
            class="d-flex align-items-center"
            :class="{ 'opacity-50': currentStep !== idx + 1 }"
          >
            <span
              class="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
              :class="currentStep >= idx + 1 ? 'bg-primary text-white' : 'bg-secondary text-white'"
              style="width: 36px; height: 36px;"
              :aria-current="currentStep === idx + 1 ? 'step' : undefined"
            >
              {{ currentStep > idx + 1 ? '✓' : idx + 1 }}
            </span>
            <span class="d-none d-sm-inline fw-bold">{{ label }}</span>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-6">
            <!-- Step 1: Your Details -->
            <form v-if="currentStep === 1" @submit.prevent="nextStep" novalidate>
              <div class="mb-3">
                <label for="participantName" class="form-label">Full Name <span class="text-danger">*</span></label>
                <input
                  id="participantName"
                  v-model="form.participantName"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.participantName, 'is-valid': form.participantName && !formErrors.participantName }"
                  placeholder="Enter your full name"
                />
                <div v-if="formErrors.participantName" class="invalid-feedback d-block">{{ formErrors.participantName }}</div>
              </div>

              <div class="mb-3">
                <label for="participantPhone" class="form-label">Mobile Phone <span class="text-danger">*</span></label>
                <input
                  id="participantPhone"
                  v-model="form.participantPhone"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.participantPhone, 'is-valid': form.participantPhone && !formErrors.participantPhone }"
                  placeholder="0412 345 678"
                />
                <div v-if="formErrors.participantPhone" class="invalid-feedback d-block">{{ formErrors.participantPhone }}</div>
              </div>

              <div class="mb-3">
                <label for="participantEmail" class="form-label">Email Address</label>
                <input
                  id="participantEmail"
                  v-model="form.participantEmail"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.participantEmail }"
                  placeholder="your@email.com"
                />
                <div v-if="formErrors.participantEmail" class="invalid-feedback d-block">{{ formErrors.participantEmail }}</div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-100">
                Next: Participants →
              </button>
            </form>

            <!-- Step 2: Participants -->
            <form v-if="currentStep === 2" @submit.prevent="nextStep" novalidate>
              <div class="mb-3">
                <label for="participants" class="form-label">Number of Participants (1–5) <span class="text-danger">*</span></label>
                <input
                  id="participants"
                  v-model.number="form.participants"
                  type="number"
                  min="1"
                  max="5"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.participants, 'is-valid': form.participants >= 1 && !formErrors.participants }"
                />
                <div v-if="formErrors.participants" class="invalid-feedback d-block">{{ formErrors.participants }}</div>
              </div>

              <div class="mb-3">
                <label for="specialRequirements" class="form-label">Special Requirements (optional)</label>
                <textarea
                  id="specialRequirements"
                  v-model="form.specialRequirements"
                  class="form-control"
                  rows="3"
                  placeholder="e.g. wheelchair access, dietary requirements, hearing assistance..."
                ></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary btn-lg flex-fill" @click="prevStep">
                  ← Back
                </button>
                <button type="submit" class="btn btn-primary btn-lg flex-fill">
                  Next: Emergency Contact →
                </button>
              </div>
            </form>

            <!-- Step 3: Emergency Contact -->
            <form v-if="currentStep === 3" @submit.prevent="submitBooking" novalidate>
              <div class="mb-3">
                <label for="emergencyContact" class="form-label">Emergency Contact Name <span class="text-danger">*</span></label>
                <input
                  id="emergencyContact"
                  v-model="form.emergencyContact"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.emergencyContact, 'is-valid': form.emergencyContact && !formErrors.emergencyContact }"
                  placeholder="Name of your emergency contact"
                />
                <div v-if="formErrors.emergencyContact" class="invalid-feedback d-block">{{ formErrors.emergencyContact }}</div>
              </div>

              <div class="mb-3">
                <label for="emergencyPhone" class="form-label">Emergency Contact Phone <span class="text-danger">*</span></label>
                <input
                  id="emergencyPhone"
                  v-model="form.emergencyPhone"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.emergencyPhone, 'is-valid': form.emergencyPhone && !formErrors.emergencyPhone }"
                  placeholder="0412 345 678"
                />
                <div v-if="formErrors.emergencyPhone" class="invalid-feedback d-block">{{ formErrors.emergencyPhone }}</div>
              </div>

              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary btn-lg flex-fill" @click="prevStep">
                  ← Back
                </button>
                <button
                  type="submit"
                  class="btn btn-success btn-lg flex-fill"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Submitting...' : '✅ Confirm Booking' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
