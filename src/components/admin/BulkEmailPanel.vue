<script setup>
import { ref, computed, watch } from 'vue'
import { sendBulkEmail } from '@/services/emailService'

const props = defineProps({
  users: { type: Array, default: () => [] },
})

const subject = ref('')
const message = ref('')
const selectedRole = ref('all')
const isSending = ref(false)
const sendResults = ref([])
const showResults = ref(false)
const checkedIds = ref(new Set())

const seniors = computed(() => props.users.filter(u => u.role === 'senior'))
const caregivers = computed(() => props.users.filter(u => u.role === 'caregiver'))

const filteredRecipients = computed(() => {
  if (selectedRole.value === 'all') return props.users
  return props.users.filter(u => u.role === selectedRole.value)
})

// When role filter changes, auto-select all visible
watch(selectedRole, () => {
  checkedIds.value = new Set(filteredRecipients.value.map(u => u.id || u.email))
})

// Initialize with all selected
watch(() => props.users, () => {
  checkedIds.value = new Set(filteredRecipients.value.map(u => u.id || u.email))
}, { immediate: true })

const checkedRecipients = computed(() =>
  filteredRecipients.value.filter(u => checkedIds.value.has(u.id || u.email))
)

const allChecked = computed(() =>
  filteredRecipients.value.length > 0 && checkedRecipients.value.length === filteredRecipients.value.length
)

function toggleUser(id) {
  const newSet = new Set(checkedIds.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  checkedIds.value = newSet
}

function toggleAll() {
  if (allChecked.value) {
    checkedIds.value = new Set()
  } else {
    checkedIds.value = new Set(filteredRecipients.value.map(u => u.id || u.email))
  }
}

function selectAll() { selectedRole.value = 'all' }
function selectSeniors() { selectedRole.value = 'senior' }
function selectCaregivers() { selectedRole.value = 'caregiver' }

async function handleSend() {
  if (!subject.value.trim() || !message.value.trim()) {
    alert('Please fill in both subject and message.')
    return
  }
  if (checkedRecipients.value.length === 0) {
    alert('No recipients selected. Please check at least one user.')
    return
  }
  if (!confirm(`Send email to ${checkedRecipients.value.length} recipient(s)?`)) return

  isSending.value = true
  showResults.value = false
  try {
    const emails = checkedRecipients.value.map(u => u.email).filter(Boolean)
    const results = await sendBulkEmail(emails, subject.value.trim(), message.value.trim())
    sendResults.value = results
    showResults.value = true
  } catch (err) {
    alert('Failed to send emails: ' + err.message)
  } finally {
    isSending.value = false
  }
}

const sentCount = computed(() => sendResults.value.filter(r => r.status === 'sent').length)
const failedCount = computed(() => sendResults.value.filter(r => r.status === 'failed').length)
</script>

<template>
  <div class="bulk-email-panel">
    <h3 class="h5 mb-3">📧 Send Bulk Email</h3>
    <p class="text-muted small mb-3">
      Select individual recipients below. Requires EmailJS configuration in <code>.env</code>.
    </p>

    <!-- Role Filter -->
    <div class="mb-2">
      <div class="btn-group btn-group-sm w-100" role="group" aria-label="Filter recipients by role">
        <button class="btn" :class="selectedRole === 'all' ? 'btn-primary' : 'btn-outline-primary'" @click="selectAll">
          All ({{ users.length }})
        </button>
        <button class="btn" :class="selectedRole === 'senior' ? 'btn-primary' : 'btn-outline-primary'" @click="selectSeniors">
          Seniors ({{ seniors.length }})
        </button>
        <button class="btn" :class="selectedRole === 'caregiver' ? 'btn-primary' : 'btn-outline-primary'" @click="selectCaregivers">
          Caregivers ({{ caregivers.length }})
        </button>
      </div>
    </div>

    <!-- Recipient Checkbox List -->
    <div class="card mb-3" style="max-height: 200px; overflow-y: auto;">
      <div class="card-header py-1 px-2 d-flex justify-content-between align-items-center">
        <label class="form-check-label small fw-bold" style="cursor: pointer;">
          <input class="form-check-input me-1" type="checkbox" :checked="allChecked" @change="toggleAll" />
          {{ allChecked ? 'Deselect All' : 'Select All' }}
        </label>
        <span class="badge bg-primary rounded-pill">{{ checkedRecipients.length }} selected</span>
      </div>
      <div class="card-body p-1">
        <div v-if="filteredRecipients.length === 0" class="text-center text-muted small py-2">
          No users match this role.
        </div>
        <label
          v-for="u in filteredRecipients"
          :key="u.id || u.email"
          class="d-flex align-items-center px-2 py-1 border-bottom"
          style="cursor: pointer; font-size: 0.85rem;"
          :style="{ background: checkedIds.has(u.id || u.email) ? '#f0f7ff' : 'transparent' }"
        >
          <input
            class="form-check-input me-2 flex-shrink-0"
            type="checkbox"
            :checked="checkedIds.has(u.id || u.email)"
            @change="toggleUser(u.id || u.email)"
          />
          <span class="flex-grow-1">{{ u.fullName || u.displayName || 'Unknown' }}</span>
          <span class="text-muted small me-2">{{ u.email }}</span>
          <span class="badge bg-secondary rounded-pill small">{{ u.role }}</span>
        </label>
      </div>
    </div>

    <!-- Subject -->
    <div class="mb-3">
      <label for="bulk-subject" class="form-label fw-bold small">Subject</label>
      <input id="bulk-subject" v-model="subject" type="text" class="form-control form-control-sm" placeholder="Email subject line..." />
    </div>

    <!-- Message -->
    <div class="mb-3">
      <label for="bulk-message" class="form-label fw-bold small">Message</label>
      <textarea id="bulk-message" v-model="message" class="form-control form-control-sm" rows="4" placeholder="Write your message..."></textarea>
    </div>

    <button class="btn btn-primary w-100" :disabled="isSending || checkedRecipients.length === 0" @click="handleSend">
      {{ isSending ? 'Sending...' : '📤 Send to ' + checkedRecipients.length + ' Recipient(s)' }}
    </button>

    <!-- Results -->
    <div v-if="showResults" class="mt-3">
      <div class="alert" :class="failedCount === 0 ? 'alert-success' : 'alert-warning'">
        <strong>{{ sentCount }}</strong> sent, <strong>{{ failedCount }}</strong> failed
      </div>
      <div v-if="failedCount > 0" class="small">
        <div v-for="r in sendResults.filter(r => r.status === 'failed')" :key="r.email" class="text-danger mb-1">
          ❌ {{ r.email }}: {{ r.error }}
        </div>
      </div>
    </div>
  </div>
</template>
