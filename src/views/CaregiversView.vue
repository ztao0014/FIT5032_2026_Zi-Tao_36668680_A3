<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

const resources = [
  { title: 'Daily Care Checklist', description: 'A printable daily care plan template for tracking medications, meals, and activities.', type: 'PDF' },
  { title: 'Memory-Stimulating Activities Guide', description: '10 brain-stimulating activities to do together, from puzzles to music therapy.', type: 'PDF' },
  { title: 'Alzheimer\'s Stage-by-Stage Guide', description: 'What to expect at each stage and how to prepare.', type: 'Article' },
  { title: 'Self-Care for Caregivers', description: 'Practical tips to prevent burnout while caring for a loved one.', type: 'Guide' },
]

const stages = [
  { title: 'Stage 1: Early Signs', description: 'Mild forgetfulness, difficulty finding words, slight mood changes. Begin discussions about future planning.' },
  { title: 'Stage 2: Moderate Changes', description: 'Increased confusion, difficulty with daily tasks, possible personality changes. Consider in-home support services.' },
  { title: 'Stage 3: Advanced Care', description: 'Significant memory loss, requires assistance with personal care, reduced mobility. Explore residential care options.' },
]
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-3">👨‍👩‍👦 For Caregivers</h1>
    <p class="lead text-muted mb-4">Resources, tools, and support designed for family caregivers.</p>

    <!-- Login Prompt -->
    <div v-if="!isLoggedIn" class="alert alert-warning text-center">
      ⚠️ Please <router-link to="/login" class="alert-link">log in</router-link> to access caregiver resources and track referrals.
    </div>

    <!-- Quick Actions -->
    <div class="row g-4 mb-5">
      <div class="col-md-4">
        <div class="card h-100 shadow-sm text-center border-primary border-2">
          <div class="card-body d-flex flex-column">
            <span style="font-size: 2.5rem;">📝</span>
            <h3 class="h5">Apply for Subsidies</h3>
            <p class="card-text small">Check eligibility and apply for government home care subsidies.</p>
            <button class="btn btn-primary mt-auto" :disabled="!isLoggedIn">Start Application →</button>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 shadow-sm text-center border-success border-2">
          <div class="card-body d-flex flex-column">
            <span style="font-size: 2.5rem;">📊</span>
            <h3 class="h5">Track Referral Status</h3>
            <p class="card-text small">View the status of your submitted service applications in one place.</p>
            <button class="btn btn-success mt-auto" :disabled="!isLoggedIn">View Dashboard →</button>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 shadow-sm text-center border-warning border-2">
          <div class="card-body d-flex flex-column">
            <span style="font-size: 2.5rem;">📥</span>
            <h3 class="h5">Download Resources</h3>
            <p class="card-text small">Printable checklists, guides, and care plans — all in large print.</p>
            <button class="btn btn-warning mt-auto" :disabled="!isLoggedIn">Browse Downloads →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Print-Friendly Download Center -->
    <h2 class="mb-3">📥 Print-Friendly Download Centre</h2>
    <div class="row g-4 mb-5">
      <div class="col-md-6" v-for="r in resources" :key="r.title">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-start">
            <div>
              <span class="badge bg-sb-blue mb-2">{{ r.type }}</span>
              <h3 class="h5">{{ r.title }}</h3>
              <p class="card-text small text-muted mb-0">{{ r.description }}</p>
            </div>
            <button class="btn btn-outline-primary btn-sm ms-3" :disabled="!isLoggedIn">📥</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pathway Navigation -->
    <h2 class="mb-3">🧭 Understanding the Journey: Stage-by-Stage</h2>
    <div class="row g-4">
      <div class="col-lg-4" v-for="s in stages" :key="s.title">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h3 class="h5">{{ s.title }}</h3>
            <p class="card-text">{{ s.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
