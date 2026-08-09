<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

const showSubsidyModal = ref(false)
const showReferralModal = ref(false)
const subsidySubmitted = ref(false)
const downloadCentre = ref(null)

const subsidyForm = ref({
  fullName: '',
  dateOfBirth: '',
  medicareNumber: '',
  careType: '',
  additionalInfo: '',
})

function openSubsidyModal() {
  if (!isLoggedIn.value) return
  subsidySubmitted.value = false
  subsidyForm.value = { fullName: '', dateOfBirth: '', medicareNumber: '', careType: '', additionalInfo: '' }
  showSubsidyModal.value = true
}

function submitSubsidy() {
  subsidySubmitted.value = true
}

function openReferralModal() {
  if (!isLoggedIn.value) return
  showReferralModal.value = true
}

function scrollToDownloads() {
  if (downloadCentre.value) {
    downloadCentre.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const resources = [
  { title: 'Daily Care Checklist', description: 'A printable daily care plan template for tracking medications, meals, and activities.', type: 'PDF' },
  { title: 'Memory-Stimulating Activities Guide', description: '10 brain-stimulating activities to do together, from puzzles to music therapy.', type: 'PDF' },
  { title: "Alzheimer's Stage-by-Stage Guide", description: 'What to expect at each stage and how to prepare.', type: 'Article' },
  { title: 'Self-Care for Caregivers', description: 'Practical tips to prevent burnout while caring for a loved one.', type: 'Guide' },
]

const stages = [
  { title: 'Stage 1: Early Signs', description: 'Mild forgetfulness, difficulty finding words, slight mood changes. Begin discussions about future planning.' },
  { title: 'Stage 2: Moderate Changes', description: 'Increased confusion, difficulty with daily tasks, possible personality changes. Consider in-home support services.' },
  { title: 'Stage 3: Advanced Care', description: 'Significant memory loss, requires assistance with personal care, reduced mobility. Explore residential care options.' },
]

const referrals = [
  { id: 'REF-2024-001', service: 'Home Care Package Level 2', submitted: '2024-07-15', status: 'Under Review', progress: 60 },
  { id: 'REF-2024-002', service: 'Commonwealth Home Support', submitted: '2024-08-01', status: 'Approved', progress: 100 },
  { id: 'REF-2024-003', service: 'Residential Respite Care', submitted: '2024-08-05', status: 'Pending Documents', progress: 30 },
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
            <button class="btn btn-primary mt-auto" @click="openSubsidyModal">Start Application →</button>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 shadow-sm text-center border-success border-2">
          <div class="card-body d-flex flex-column">
            <span style="font-size: 2.5rem;">📊</span>
            <h3 class="h5">Track Referral Status</h3>
            <p class="card-text small">View the status of your submitted service applications in one place.</p>
            <button class="btn btn-success mt-auto" @click="openReferralModal">View Dashboard →</button>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 shadow-sm text-center border-warning border-2">
          <div class="card-body d-flex flex-column">
            <span style="font-size: 2.5rem;">📥</span>
            <h3 class="h5">Download Resources</h3>
            <p class="card-text small">Printable checklists, guides, and care plans — all in large print.</p>
            <button class="btn btn-warning mt-auto" @click="scrollToDownloads">Browse Downloads →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Print-Friendly Download Center -->
    <div ref="downloadCentre">
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
              <button class="btn btn-outline-primary btn-sm ms-3" @click="scrollToDownloads">📥</button>
            </div>
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

    <!-- Subsidy Application Modal -->
    <div v-if="showSubsidyModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">📝 Apply for Home Care Subsidy</h5>
            <button type="button" class="btn-close btn-close-white" @click="showSubsidyModal = false"></button>
          </div>
          <div class="modal-body" v-if="!subsidySubmitted">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Full Name</label>
                <input v-model="subsidyForm.fullName" type="text" class="form-control" placeholder="Your full name" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Date of Birth</label>
                <input v-model="subsidyForm.dateOfBirth" type="date" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Medicare Number</label>
                <input v-model="subsidyForm.medicareNumber" type="text" class="form-control" placeholder="e.g. 2123 45678 1" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Care Type Needed</label>
                <select v-model="subsidyForm.careType" class="form-select">
                  <option value="">— Select —</option>
                  <option>Home Care Package (Level 1–4)</option>
                  <option>Commonwealth Home Support Programme</option>
                  <option>Residential Aged Care</option>
                  <option>Respite Care</option>
                  <option>Not sure — need assessment</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Additional Information</label>
                <textarea v-model="subsidyForm.additionalInfo" class="form-control" rows="3" placeholder="Tell us about your situation..."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-body text-center py-5" v-else>
            <span style="font-size: 4rem;">✅</span>
            <h4 class="mt-3">Application Submitted!</h4>
            <p class="text-muted">Your subsidy application has been received. We will review it and contact you within 5 business days.</p>
            <p class="small text-muted">Reference: SUB-{{ Date.now().toString(36).toUpperCase() }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showSubsidyModal = false">{{ subsidySubmitted ? 'Close' : 'Cancel' }}</button>
            <button v-if="!subsidySubmitted" class="btn btn-primary" @click="submitSubsidy">Submit Application</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Referral Status Modal -->
    <div v-if="showReferralModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">📊 Referral Status Dashboard</h5>
            <button type="button" class="btn-close btn-close-white" @click="showReferralModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Reference ID</th>
                    <th>Service</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in referrals" :key="r.id">
                    <td><code>{{ r.id }}</code></td>
                    <td>{{ r.service }}</td>
                    <td>{{ r.submitted }}</td>
                    <td>
                      <span class="badge" :class="{
                        'bg-warning text-dark': r.status === 'Under Review' || r.status === 'Pending Documents',
                        'bg-success': r.status === 'Approved'
                      }">{{ r.status }}</span>
                    </td>
                    <td>
                      <div class="progress" style="height: 6px;">
                        <div class="progress-bar" :class="{ 'bg-success': r.progress === 100 }"
                          :style="{ width: r.progress + '%' }"></div>
                      </div>
                      <small class="text-muted">{{ r.progress }}%</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showReferralModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
