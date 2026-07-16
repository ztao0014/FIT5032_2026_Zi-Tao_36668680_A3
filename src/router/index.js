import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/health-resources',
      name: 'health-resources',
      component: () => import('../views/HealthResourcesView.vue'),
    },
    {
      path: '/health-resources/:id',
      name: 'health-resource-detail',
      component: () => import('../views/HealthResourceDetailView.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue'),
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('../views/EventDetailView.vue'),
    },
    {
      path: '/events/:id/book',
      name: 'event-booking',
      component: () => import('../views/BookingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/get-support',
      name: 'get-support',
      component: () => import('../views/GetSupportView.vue'),
    },
    {
      path: '/caregivers',
      name: 'caregivers',
      component: () => import('../views/CaregiversView.vue'),
      meta: { requiresAuth: true, roles: ['senior', 'caregiver', 'admin'] },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

// Navigation Guard — Authentication & Authorization
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // Route requires specific roles
  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!authStore.isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
    if (!to.meta.roles.includes(authStore.userRole)) {
      return next({ path: '/', query: { denied: '1' } })
    }
  }

  // Route is guest-only (login/register pages)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ path: '/' })
  }

  next()
})

export default router
