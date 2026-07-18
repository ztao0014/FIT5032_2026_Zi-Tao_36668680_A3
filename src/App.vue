<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/common/AppNavbar.vue'
import AppFooter from './components/common/AppFooter.vue'
import AccessibilityBar from './components/common/AccessibilityBar.vue'
import EmergencyButton from './components/common/EmergencyButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Back to top button
const showBackToTop = ref(false)

function handleScroll() {
  showBackToTop.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Scroll-reveal: observe elements with .reveal class
let observer = null

function setupRevealObserver() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
}

onMounted(async () => {
  await authStore.initAuthListener()
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Run reveal after a small delay so DOM is ready
  setTimeout(setupRevealObserver, 300)

  // Also observe after each route change
  const origPush = history.pushState
  history.pushState = function (...args) {
    origPush.apply(this, args)
    setTimeout(setupRevealObserver, 300)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
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

  <!-- Back to Top -->
  <button
    class="back-to-top"
    :class="{ visible: showBackToTop }"
    @click="scrollToTop"
    aria-label="Back to top of page"
    title="Back to top"
  >
    ↑
  </button>
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1 0 auto;
}
</style>
