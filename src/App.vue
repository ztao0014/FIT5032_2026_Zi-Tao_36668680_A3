<script setup>
import { onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/common/AppNavbar.vue'
import AppFooter from './components/common/AppFooter.vue'
import AccessibilityBar from './components/common/AccessibilityBar.vue'
import EmergencyButton from './components/common/EmergencyButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Plain language toggle state — shared across components
// (can be extended with provide/inject)

onMounted(async () => {
  // Initialize Firebase auth listener (persists login state)
  await authStore.initAuthListener()
})
</script>

<template>
  <!-- Skip navigation link for keyboard users -->
  <a href="#main-content" class="skip-nav">Skip to main content</a>

  <AppNavbar />
  <AccessibilityBar />

  <main id="main-content" class="flex-shrink-0">
    <RouterView />
  </main>

  <AppFooter />
  <EmergencyButton />
</template>

<style>
/* App-level layout: push footer to bottom */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1 0 auto;
}
</style>
