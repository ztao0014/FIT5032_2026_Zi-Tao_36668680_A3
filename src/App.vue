<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppNavbar from './components/common/AppNavbar.vue'
import AppFooter from './components/common/AppFooter.vue'
import AccessibilityBar from './components/common/AccessibilityBar.vue'
import EmergencyButton from './components/common/EmergencyButton.vue'
import RoleSelectionModal from './components/common/RoleSelectionModal.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Access denied banner
const accessDenied = ref(false)
const deniedPath = ref('')

watch(() => route.query.accessDenied, (val) => {
  if (val) {
    deniedPath.value = val
    accessDenied.value = true
    // Remove just the query param, preserve the current path
    const { accessDenied, ...rest } = route.query
    router.replace({ query: rest })
  }
}, { immediate: true })

function dismissDenied() {
  accessDenied.value = false
}

// Back to top button
const showBackToTop = ref(false)

function handleScroll() {
  showBackToTop.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Scroll-reveal
let observer = null

function setupRevealObserver() {
  // Older browsers without IntersectionObserver: show content immediately.
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
    return
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.15 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
  // Safety net: never leave content hidden if the observer fails to fire,
  // which would make cards (and their buttons) invisible/unclickable.
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'))
  }, 1200)
}

onMounted(async () => {
  await authStore.initAuthListener()
  window.addEventListener('scroll', handleScroll, { passive: true })
  setTimeout(setupRevealObserver, 300)
})

// Re-trigger reveal animation after every route change
router.afterEach(async () => {
  await nextTick()
  setTimeout(setupRevealObserver, 150)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
})
</script>

<template>
  <a href="#main-content" class="skip-nav">Skip to main content</a>

  <!-- Access Denied Banner -->
  <div
    v-if="accessDenied"
    class="alert alert-danger alert-dismissible fade show m-0 rounded-0 text-center"
    role="alert"
  >
    <strong>⛔ Access Denied</strong> &mdash;
    You do not have permission to access <code>{{ deniedPath }}</code>.
    Please contact an administrator if you believe this is a mistake.
    <button type="button" class="btn-close" @click="dismissDenied" aria-label="Dismiss"></button>
  </div>

  <AppNavbar />
  <AccessibilityBar />

  <RoleSelectionModal v-if="authStore.needsRoleSelection" />

  <main id="main-content" class="flex-shrink-0">
    <RouterView />
  </main>

  <AppFooter />
  <EmergencyButton />

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
