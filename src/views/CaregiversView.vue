<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

const showSubsidyModal = ref(false)
const showReferralModal = ref(false)
const showResourceModal = ref(false)
const selectedResource = ref(null)
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

function openResource(title) {
  selectedResource.value = resources.find(r => r.title === title)
  showResourceModal.value = true
}

function printResource() {
  window.print()
}

const resources = [
  { title: 'Daily Care Checklist', description: 'A printable daily care plan template for tracking medications, meals, and activities.', type: 'PDF',
    content: '<h3>Daily Care Checklist</h3><p><em>Use this checklist each day to stay organised and ensure nothing is missed.</em></p><h4>☀️ Morning Routine</h4><ul><li>☐ Take morning medications at ______ (time)</li><li>☐ Prepare and serve breakfast</li><li>☐ Assist with personal hygiene — shower, teeth, dressing</li><li>☐ Check skin for any pressure points or redness</li><li>☐ Brief morning exercise or gentle stretching (10 min)</li></ul><h4>🌤 Afternoon</h4><ul><li>☐ Prepare and serve lunch</li><li>☐ Take afternoon medications at ______ (time)</li><li>☐ Engage in one activity — puzzle, music, reading, walk</li><li>☐ 15-minute rest or quiet time</li></ul><h4>🌙 Evening</h4><ul><li>☐ Prepare and serve dinner</li><li>☐ Take evening medications at ______ (time)</li><li>☐ Assist with evening hygiene routine</li><li>☐ Prepare comfortable sleep environment</li></ul><h4>📝 Notes</h4><p>_________________________________________</p><p>_________________________________________</p>' },
  { title: 'Memory-Stimulating Activities Guide', description: '10 brain-stimulating activities to do together, from puzzles to music therapy.', type: 'PDF',
    content: '<h3>10 Memory-Stimulating Activities for Seniors</h3><p><em>Try one activity each day. The goal is enjoyment — not performance.</em></p><h4>1. 🧩 Jigsaw Puzzles</h4><p>Start with 50–100 piece puzzles with clear, colourful images. Work together side by side.</p><h4>2. 🎵 Music Therapy</h4><p>Play songs from their youth. Ask them to name the artist or sing along. Music memory often remains strong.</p><h4>3. 📸 Photo Album Reminiscence</h4><p>Look through old photos together. Ask open questions: "Tell me about this day."</p><h4>4. ✍️ Simple Word Games</h4><p>Crosswords, word searches, or "name 5 things that start with B."</p><h4>5. 🎨 Colouring or Drawing</h4><p>Adult colouring books with nature themes. Use large, easy-grip pencils.</p><h4>6. 🧶 Sorting Activities</h4><p>Sort buttons by colour, coins by value, or cards by suit. Simple, calming, and satisfying.</p><h4>7. 📚 Read Aloud Together</h4><p>Short stories or poems. Pause to discuss. Let them turn the pages if able.</p><h4>8. 🌿 Sensory Stimulation</h4><p>Handle different textures — soft fabric, smooth stones, scented herbs. Describe what you feel and smell.</p><h4>9. 🗺 Name That Place</h4><p>Show pictures of landmarks or local places. Talk about visits or memories of those places.</p><h4>10. 🤝 Simple Conversation Starters</h4><p>"What was your first job?", "Favourite holiday memory?", "Best meal you ever had?"</p><p><em>Tip: Keep sessions to 15–30 minutes. Stop if they show signs of fatigue or frustration.</em></p>' },
  { title: "Alzheimer's Stage-by-Stage Guide", description: 'What to expect at each stage and how to prepare.', type: 'Article',
    content: '<h3>Alzheimer\'s Disease: Stage-by-Stage Guide</h3><p><em>Every person\'s journey is different. This guide provides a general overview of what to expect.</em></p><h4>Stage 1: Early Signs (Mild)</h4><p><strong>What you may notice:</strong></p><ul><li>Mild forgetfulness — misplacing items, forgetting recent conversations</li><li>Difficulty finding the right words</li><li>Trouble planning or organising (e.g., managing bills)</li><li>Slight mood or personality changes</li></ul><p><strong>What to do now:</strong></p><ul><li>See a GP for assessment. Early diagnosis opens doors to support.</li><li>Begin discussions about future care preferences and legal/financial planning.</li><li>Establish routines to support independence.</li><li>Encourage social engagement and physical activity.</li></ul><h4>Stage 2: Moderate Changes</h4><p><strong>What you may notice:</strong></p><ul><li>Increased confusion about time, place, or people</li><li>Difficulty with daily tasks — dressing, cooking, bathing</li><li>Possible wandering or restlessness (sundowning)</li><li>Personality changes may become more pronounced</li><li>May forget personal history or become confused about relationships</li></ul><p><strong>What to do now:</strong></p><ul><li>Consider in-home support services for respite.</li><li>Install safety devices — door alarms, grab bars, GPS tracker if wandering occurs.</li><li>Simplify clothing choices and daily routines.</li><li>Join a caregiver support group — you need support too.</li></ul><h4>Stage 3: Advanced Care</h4><p><strong>What you may notice:</strong></p><ul><li>Significant memory loss — may not recognise family members</li><li>Requires full assistance with personal care</li><li>Reduced mobility — may become bedridden</li><li>Difficulty swallowing; weight loss</li><li>Loss of verbal communication ability</li></ul><p><strong>What to do now:</strong></p><ul><li>Explore residential care options with professional 24/7 support.</li><li>Focus on comfort, dignity, and quality of life.</li><li>Use non-verbal communication — touch, music, familiar objects.</li><li>Seek palliative care guidance for end-of-life planning.</li></ul><p><em>For 24/7 support, call the National Dementia Helpline: 1800 100 500</em></p>' },
  { title: 'Self-Care for Caregivers', description: 'Practical tips to prevent burnout while caring for a loved one.', type: 'Guide',
    content: '<h3>Self-Care for Caregivers</h3><p><em>You cannot pour from an empty cup. Caring for yourself is not selfish — it is essential.</em></p><h4>⚠️ Signs of Caregiver Burnout</h4><ul><li>Feeling exhausted even after sleeping</li><li>Irritability or resentment toward the person you care for</li><li>Withdrawing from friends and activities you once enjoyed</li><li>Frequent headaches, colds, or unexplained aches</li><li>Feeling hopeless or trapped</li></ul><p><strong>If you recognise 3 or more signs, please seek support.</strong></p><h4>💙 10 Practical Self-Care Strategies</h4><ol><li><strong>Accept help.</strong> When someone offers to help, say yes. Have a list of small tasks ready.</li><li><strong>Take breaks.</strong> Even 15 minutes alone to drink tea, walk, or sit quietly makes a difference.</li><li><strong>Use respite care.</strong> Contact My Aged Care (1800 200 422) about temporary in-home or facility respite.</li><li><strong>Stay connected.</strong> Call one friend or family member each week — even a 10-minute chat helps.</li><li><strong>Prioritise your own health.</strong> Do not skip your own medical appointments, exercise, or sleep.</li><li><strong>Join a support group.</strong> Talking to other caregivers who understand is invaluable. Many are free and online.</li><li><strong>Set realistic expectations.</strong> You cannot do everything perfectly. Good enough IS good enough.</li><li><strong>Move your body.</strong> A 10-minute walk releases stress. Stretch while the kettle boils.</li><li><strong>Practise self-compassion.</strong> Speak to yourself as you would to a friend. You are doing a remarkable job.</li><li><strong>Know when to ask for professional help.</strong> If feelings of depression or anxiety persist, speak to your GP.</li></ol><h4>📞 Quick Support Contacts</h4><ul><li><strong>Carer Gateway:</strong> 1800 422 737 — free counselling, coaching, and respite</li><li><strong>Lifeline:</strong> 13 11 14 — 24/7 crisis support</li><li><strong>Beyond Blue:</strong> 1300 22 4636 — mental health support</li></ul><p><em>You are not alone. Millions of Australians provide unpaid care. Your wellbeing matters.</em></p>' },
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
              <button class="btn btn-outline-primary btn-sm ms-3" @click="openResource(r.title)">👁 View & Print</button>
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
    <!-- Resource Content Modal (Print-Friendly) -->
    <div v-if="showResourceModal && selectedResource" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-info text-white d-print-none">
            <h5 class="modal-title">{{ selectedResource.title }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="showResourceModal = false"></button>
          </div>
          <div class="modal-body" style="font-size: 1.1rem; line-height: 1.8;">
            <div v-html="selectedResource.content"></div>
          </div>
          <div class="modal-footer d-print-none">
            <button class="btn btn-outline-secondary" @click="showResourceModal = false">Close</button>
            <button class="btn btn-primary" @click="printResource">🖨 Print This Page</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
