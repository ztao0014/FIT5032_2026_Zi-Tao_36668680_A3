<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  role: 'senior',
})

const formErrors = ref({})
const isLoading = ref(false)
const serverError = ref('')

function validateForm() {
  const errors = {}

  if (!form.value.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.value.password) {
    errors.password = 'Password is required.'
  } else if (form.value.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
    errors.password = 'Password must include uppercase, lowercase, and a number.'
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

async function handleRegister() {
  serverError.value = ''
  formErrors.value = validateForm()

  if (Object.keys(formErrors.value).length > 0) return

  isLoading.value = true
  try {
    await authStore.register(form.value.email, form.value.password, form.value.role)
    router.push('/')
  } catch {
    serverError.value = authStore.error || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h1 class="text-center mb-3">📝 Register</h1>
            <p class="text-center text-muted mb-4">Create your SilverBridge Health account</p>

            <div v-if="serverError" class="alert alert-danger" role="alert">
              {{ serverError }}
            </div>

            <form @submit.prevent="handleRegister" novalidate>
              <!-- Email -->
              <div class="mb-3">
                <label for="reg-email" class="form-label">Email Address <span class="text-danger">*</span></label>
                <input
                  id="reg-email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.email, 'is-valid': form.email && !formErrors.email }"
                  placeholder="your@email.com"
                  autocomplete="email"
                />
                <div v-if="formErrors.email" class="invalid-feedback d-block">{{ formErrors.email }}</div>
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="reg-password" class="form-label">Password <span class="text-danger">*</span></label>
                <input
                  id="reg-password"
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.password, 'is-valid': form.password && !formErrors.password }"
                  placeholder="Min. 8 chars, uppercase + lowercase + number"
                  autocomplete="new-password"
                />
                <div v-if="formErrors.password" class="invalid-feedback d-block">{{ formErrors.password }}</div>
                <small class="text-muted">Must contain at least 8 characters, including uppercase, lowercase, and a number.</small>
              </div>

              <!-- Confirm Password -->
              <div class="mb-3">
                <label for="reg-confirm" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                <input
                  id="reg-confirm"
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.confirmPassword, 'is-valid': form.confirmPassword && !formErrors.confirmPassword }"
                  placeholder="Re-enter your password"
                  autocomplete="new-password"
                />
                <div v-if="formErrors.confirmPassword" class="invalid-feedback d-block">{{ formErrors.confirmPassword }}</div>
              </div>

              <!-- Role Selection -->
              <div class="mb-3">
                <label for="reg-role" class="form-label">I am a... <span class="text-danger">*</span></label>
                <select id="reg-role" v-model="form.role" class="form-select">
                  <option value="senior">🧓 Senior (65+)</option>
                  <option value="caregiver">👨‍👩‍👦 Caregiver / Family Member</option>
                </select>
              </div>

              <button
                type="submit"
                class="btn btn-warning btn-lg w-100 mb-3"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Creating Account...' : '📝 Create Account' }}
              </button>
            </form>

            <hr />

            <p class="text-center mb-0">
              Already have an account?
              <router-link to="/login">Log in here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
