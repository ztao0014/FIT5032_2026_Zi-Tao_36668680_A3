<script setup>
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { stripHtml } from '@/utils/sanitize'

const callNumber = '1800-SILVER'
const callHref = 'tel:1800745837'

const form = ref({
  name: '',
  phone: '',
  email: '',
  urgency: 'non-urgent',
  message: '',
})

const formErrors = ref({})
const submitSuccess = ref(false)
const isSubmitting = ref(false)

function validateForm() {
  const errors = {}
  if (!form.value.name.trim()) errors.name = 'Name is required.'
  if (!form.value.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!/^04\d{8}$/.test(form.value.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid Australian mobile number.'
  }
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!form.value.message.trim()) errors.message = 'Please describe your concern.'
  return errors
}

async function submitForm() {
  formErrors.value = validateForm()
  if (Object.keys(formErrors.value).length > 0) return

  isSubmitting.value = true
  try {
    await addDoc(collection(db, 'supportRequests'), {
      name: stripHtml(form.value.name),
      phone: form.value.phone,
      email: form.value.email.trim(),
      urgency: form.value.urgency,
      message: stripHtml(form.value.message),
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    submitSuccess.value = true
  } catch (err) {
    console.error('Support request failed:', err)
    alert('Could not submit your request. Please call us directly.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-3">🆘 Get Support</h1>
    <p class="lead text-muted mb-4">We are here to help. Choose the option that best suits your needs.</p>

    <!-- Emergency Call Card -->
    <div class="card border-danger border-3 mb-5 shadow">
      <div class="card-body text-center py-4">
        <div style="font-size: 3rem;">📞</div>
        <h2 class="text-danger">Need Urgent Help?</h2>
        <p class="lead">Call our 24/7 support line for immediate assistance.</p>
        <a :href="callHref" class="btn btn-danger btn-lg px-5 fw-bold">
          📞 Call {{ callNumber }}
        </a>
        <p class="text-muted small mt-2">Free call. Available 24 hours, 7 days a week.</p>
      </div>
    </div>

    <div class="row g-4">
      <!-- Support Form -->
      <div class="col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="h4">Request a Call Back</h2>
            <p class="text-muted">Fill in the form below and one of our support coordinators will call you within 24 hours.</p>

            <div v-if="submitSuccess" class="alert alert-success">
              ✅ Your support request has been submitted. We will call you within 24 hours.
            </div>

            <form v-else @submit.prevent="submitForm" novalidate>
              <div class="mb-3">
                <label for="sup-name" class="form-label">Your Name <span class="text-danger">*</span></label>
                <input id="sup-name" v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': formErrors.name }" />
                <div v-if="formErrors.name" class="invalid-feedback d-block">{{ formErrors.name }}</div>
              </div>

              <div class="mb-3">
                <label for="sup-phone" class="form-label">Phone Number <span class="text-danger">*</span></label>
                <input id="sup-phone" v-model="form.phone" type="tel" class="form-control" :class="{ 'is-invalid': formErrors.phone }" />
                <div v-if="formErrors.phone" class="invalid-feedback d-block">{{ formErrors.phone }}</div>
              </div>

              <div class="mb-3">
                <label for="sup-email" class="form-label">Email (optional)</label>
                <input id="sup-email" v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': formErrors.email }" />
                <div v-if="formErrors.email" class="invalid-feedback d-block">{{ formErrors.email }}</div>
              </div>

              <div class="mb-3">
                <label for="sup-urgency" class="form-label">Urgency Level</label>
                <select id="sup-urgency" v-model="form.urgency" class="form-select">
                  <option value="non-urgent">Non-urgent — General enquiry</option>
                  <option value="urgent">Urgent — Need help within 24 hours</option>
                  <option value="emergency">Emergency — Need immediate assistance</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="sup-message" class="form-label">How can we help? <span class="text-danger">*</span></label>
                <textarea id="sup-message" v-model="form.message" class="form-control" rows="4" :class="{ 'is-invalid': formErrors.message }" placeholder="Describe your situation..."></textarea>
                <div v-if="formErrors.message" class="invalid-feedback d-block">{{ formErrors.message }}</div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="isSubmitting">
                {{ isSubmitting ? 'Submitting...' : '📩 Submit Request' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Other Support Options -->
      <div class="col-lg-6">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h3 class="h5">📋 Service Applications</h3>
            <ul class="list-unstyled">
              <li class="mb-2">✅ <strong>Home Safety Assessment</strong> — Get grab bars, ramps, and trip hazard removal</li>
              <li class="mb-2">✅ <strong>Meal Delivery Service</strong> — Nutritious meals delivered to your door</li>
              <li class="mb-2">✅ <strong>Transport Assistance</strong> — Help getting to medical appointments</li>
              <li class="mb-2">✅ <strong>Social Connection Program</strong> — Weekly visits from a volunteer companion</li>
            </ul>
            <router-link to="/caregivers" class="btn btn-outline-primary">Apply for Services →</router-link>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="h5">📞 Other Helplines</h3>
            <ul class="list-unstyled">
              <li class="mb-2">🧑‍⚕️ <strong>HealthDirect:</strong> <a href="tel:1800022222">1800 022 222</a></li>
              <li class="mb-2">🧠 <strong>Dementia Australia:</strong> <a href="tel:1800100500">1800 100 500</a></li>
              <li class="mb-2">💜 <strong>Lifeline (Crisis Support):</strong> <a href="tel:131114">13 11 14</a></li>
              <li class="mb-2">👴 <strong>My Aged Care:</strong> <a href="tel:1800200422">1800 200 422</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
