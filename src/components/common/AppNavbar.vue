<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.userRole)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark navbar-silverbridge sticky-top"
    style="background: var(--sb-primary-dark);"
    aria-label="Main navigation"
  >
    <div class="container">
      <RouterLink class="navbar-brand fw-bold fs-4" to="/">
        🏥 SilverBridge Health
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation menu"
      >
        <span class="navbar-toggler-icon"></span>
        <span class="ms-2 text-white fw-bold">MENU</span>
      </button>

      <div id="mainNavbar" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" exact-active-class="active">
              🏠 HOME
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/events" active-class="active">
              📅 EVENTS
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/health-resources" active-class="active">
              📚 HEALTH RESOURCES
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/caregivers" active-class="active">
              👨‍👩‍👦 FOR CAREGIVERS
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/get-support" active-class="active">
              🆘 GET SUPPORT
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/contact" active-class="active">
              📞 CONTACT
            </RouterLink>
          </li>

          <template v-if="!isLoggedIn">
            <li class="nav-item ms-lg-2">
              <RouterLink class="btn btn-outline-light mt-2 mt-lg-0" to="/login">
                LOG IN
              </RouterLink>
            </li>
            <li class="nav-item ms-lg-2">
              <RouterLink class="btn btn-warning mt-2 mt-lg-0" to="/register">
                REGISTER
              </RouterLink>
            </li>
          </template>
          <template v-else>
            <li class="nav-item ms-lg-2">
              <RouterLink class="nav-link" to="/profile">
                👤 MY PROFILE
              </RouterLink>
            </li>
            <li class="nav-item ms-lg-2">
              <button class="btn btn-outline-light mt-2 mt-lg-0" @click="handleLogout">
                LOG OUT
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
