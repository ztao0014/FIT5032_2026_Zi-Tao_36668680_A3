<script setup>
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const formErrors = ref({})
const submitSuccess = ref(false)
const isSubmitting = ref(false)

function validateForm() {
  const errors = {}
  if (!form.value.name.trim()) errors.name = 'Name is required.'
  if (!form.value.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!form.value.message.trim()) errors.message = 'Message is required.'
  return errors
}

async function submitForm() {
  formErrors.value = validateForm()
  if (Object.keys(formErrors.value).length > 0) return

  isSubmitting.value = true
  try {
    await addDoc(collection(db, 'contactMessages'), {
      ...form.value,
      createdAt: new Date().toISOString(),
    })
    submitSuccess.value = true
  } catch (err) {
    console.error('Contact form failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const officeInfo = {
  address: 'Level 5, 200 Collins Street, Melbourne VIC 3000',
  phone: '1800-SILVER (1800 745 837)',
  email: 'help@silverbridgehealth.org.au',
  hours: 'Monday–Friday: 9:00 AM – 5:00 PM<br />Saturday: 10:00 AM – 2:00 PM<br />Sunday: Closed',
}
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-3">📞 Contact Us</h1>
    <p class="lead text-muted mb-4">We would love to hear from you. Reach out with any questions, feedback, or suggestions.</p>

    <div class="row g-4">
      <!-- Contact Form -->
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="h4">Send Us a Message</h2>

            <div v-if="submitSuccess" class="alert alert-success">
              ✅ Thank you for your message! We will get back to you within 2 business days.
            </div>

            <form v-else @submit.prevent="submitForm" novalidate>
              <div class="mb-3">
                <label for="contact-name" class="form-label">Your Name <span class="text-danger">*</span></label>
                <input id="contact-name" v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': formErrors.name }" />
                <div v-if="formErrors.name" class="invalid-feedback d-block">{{ formErrors.name }}</div>
              </div>

              <div class="mb-3">
                <label for="contact-email" class="form-label">Email Address <span class="text-danger">*</span></label>
                <input id="contact-email" v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': formErrors.email }" />
                <div v-if="formErrors.email" class="invalid-feedback d-block">{{ formErrors.email }}</div>
              </div>

              <div class="mb-3">
                <label for="contact-subject" class="form-label">Subject</label>
                <select id="contact-subject" v-model="form.subject" class="form-select">
                  <option value="">— Select —</option>
                  <option value="general">General Enquiry</option>
                  <option value="feedback">Website Feedback</option>
                  <option value="volunteer">Volunteer Opportunities</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="contact-message" class="form-label">Your Message <span class="text-danger">*</span></label>
                <textarea id="contact-message" v-model="form.message" class="form-control" rows="5" :class="{ 'is-invalid': formErrors.message }" placeholder="Type your message here..."></textarea>
                <div v-if="formErrors.message" class="invalid-feedback d-block">{{ formErrors.message }}</div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="isSubmitting">
                {{ isSubmitting ? 'Sending...' : '📩 Send Message' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Office Info & Map Placeholder -->
      <div class="col-lg-5">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h2 class="h5">📍 Our Office</h2>
            <address>
              <strong>{{ officeInfo.address }}</strong><br /><br />
              📞 <a :href="'tel:1800745837'">{{ officeInfo.phone }}</a><br />
              📧 <a :href="'mailto:' + officeInfo.email">{{ officeInfo.email }}</a>
            </address>
            <hr />
            <p class="mb-0"><strong>Opening Hours:</strong></p>
            <p v-html="officeInfo.hours" class="small"></p>
          </div>
        </div>

        <!-- Map Placeholder -->
        <div class="card shadow-sm">
          <div class="card-body text-center py-5 bg-light">
            <span style="font-size: 3rem;">🗺️</span>
            <p class="text-muted mb-0 mt-2">Map integration coming in Phase 2</p>
            <p class="small text-muted">Google Maps API — office location, directions, and nearby services</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
