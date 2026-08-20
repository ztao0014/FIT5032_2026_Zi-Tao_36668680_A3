<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const redirectPath = ref(route.query.redirect || '/')

async function handleLogin() {
  errorMessage.value = ''
  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push(redirectPath.value)
  } catch {
    errorMessage.value = authStore.error || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function handleGoogleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await authStore.loginWithGoogle()
    // If this is a first-time Google sign-in, a role-selection modal is
    // shown globally (see App.vue / RoleSelectionModal) after navigation.
    router.push(redirectPath.value)
  } catch {
    errorMessage.value = authStore.error || 'Google login failed.'
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
            <h1 class="text-center mb-3">🔐 Log In</h1>
            <p class="text-center text-muted mb-4">Welcome back to SilverBridge Health</p>

            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleLogin" novalidate>
              <div class="mb-3">
                <label for="login-email" class="form-label">Email Address</label>
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  class="form-control"
                  placeholder="your@email.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="login-password" class="form-label">Password</label>
                <input
                  id="login-password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-100 mb-3"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Logging in...' : 'Log In' }}
              </button>
            </form>

            <hr />

            <button
              class="btn btn-outline-dark btn-lg w-100 mb-3"
              @click="handleGoogleLogin"
              :disabled="isLoading"
            >
              🅶 Continue with Google
            </button>

            <p class="text-center mb-0">
              Don't have an account?
              <router-link to="/register">Register here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
