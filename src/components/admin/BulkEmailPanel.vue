<script setup>
import { ref, computed } from 'vue'
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

const seniors = computed(() => props.users.filter(u => u.role === 'senior'))
const caregivers = computed(() => props.users.filter(u => u.role === 'caregiver'))

const filteredRecipients = computed(() => {
  if (selectedRole.value === 'all') return props.users
  return props.users.filter(u => u.role === selectedRole.value)
})

const recipientEmails = computed(() => filteredRecipients.value.map(u => u.email).filter(Boolean))

function selectAll() { selectedRole.value = 'all' }
function selectSeniors() { selectedRole.value = 'senior' }
function selectCaregivers() { selectedRole.value = 'caregiver' }

async function handleSend() {
  if (!subject.value.trim() || !message.value.trim()) {
    alert('Please fill in both subject and message.')
    return
  }
  if (recipientEmails.value.length === 0) {
    alert('No recipients match the selected filter.')
    return
  }
  if (!confirm(`Send email to ${recipientEmails.value.length} recipient(s)?`)) return

  isSending.value = true
  showResults.value = false
  try {
    const results = await sendBulkEmail(recipientEmails.value, subject.value.trim(), message.value.trim())
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
      Send announcements or updates to registered users. Requires EmailJS configuration in
      <code>.env</code> (VITE_EMAILJS_* variables).
    </p>

    <!-- Recipient Filter -->
    <div class="mb-3">
      <label class="form-label fw-bold small">Recipients</label>
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
      <div class="small text-muted mt-1">{{ recipientEmails.length }} recipient(s) selected</div>
    </div>

    <!-- Subject -->
    <div class="mb-3">
      <label for="bulk-subject" class="form-label fw-bold small">Subject</label>
      <input
        id="bulk-subject"
        v-model="subject"
        type="text"
        class="form-control form-control-sm"
        placeholder="Email subject line..."
      />
    </div>

    <!-- Message -->
    <div class="mb-3">
      <label for="bulk-message" class="form-label fw-bold small">Message</label>
      <textarea
        id="bulk-message"
        v-model="message"
        class="form-control form-control-sm"
        rows="5"
        placeholder="Write your message..."
      ></textarea>
    </div>

    <button
      class="btn btn-primary w-100"
      :disabled="isSending || recipientEmails.length === 0"
      @click="handleSend"
    >
      {{ isSending ? 'Sending...' : '📤 Send to ' + recipientEmails.length + ' Recipient(s)' }}
    </button>

    <!-- Results -->
    <div v-if="showResults" class="mt-3">
      <div class="alert" :class="failedCount === 0 ? 'alert-success' : 'alert-warning'">
        <strong>{{ sentCount }}</strong> sent, <strong>{{ failedCount }}</strong> failed
      </div>
    </div>
  </div>
</template>
