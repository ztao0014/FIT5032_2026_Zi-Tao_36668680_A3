<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'

const activeTab = ref('overview')
const loading = ref(true)
const loadError = ref('')

// Data arrays
const users = ref([])
const bookings = ref([])
const supportRequests = ref([])
const contactMessages = ref([])

// Stats
const stats = computed(() => ({
  users: users.value.length,
  seniors: users.value.filter(u => u.role === 'senior').length,
  caregivers: users.value.filter(u => u.role === 'caregiver').length,
  admins: users.value.filter(u => u.role === 'admin').length,
  bookings: bookings.value.length,
  supportRequests: supportRequests.value.length,
  contactMessages: contactMessages.value.length,
  pendingSupport: supportRequests.value.filter(s => s.status === 'pending').length,
  confirmedBookings: bookings.value.filter(b => b.status === 'confirmed').length,
}))

const tabs = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: `👥 Users (${users.value.length})` },
  { id: 'bookings', label: `📅 Bookings (${bookings.value.length})` },
  { id: 'support', label: `📩 Support (${supportRequests.value.length})` },
  { id: 'messages', label: `✉️ Messages (${contactMessages.value.length})` },
]

async function loadAllData() {
  loading.value = true
  loadError.value = ''
  try {
    const [usersSnap, bookingsSnap, supportSnap, messagesSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'supportRequests'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'))),
    ])

    users.value = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    bookings.value = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    supportRequests.value = supportSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    contactMessages.value = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('Admin data load failed:', err)
    loadError.value = 'Could not load data. Check your Firestore permissions.'
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function roleBadge(role) {
  const map = { senior: 'bg-primary', caregiver: 'bg-warning text-dark', admin: 'bg-danger' }
  return map[role] || 'bg-secondary'
}

onMounted(loadAllData)
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-2">🛡️ Admin Dashboard</h1>
    <p class="text-muted mb-4">System overview and data management</p>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" style="color: var(--sb-primary);" role="status">
        <span class="visually-hidden">Loading admin data...</span>
      </div>
      <p class="text-muted mt-3">Loading system data...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="alert alert-warning">{{ loadError }}</div>

    <template v-else>
      <!-- Stats Cards (always visible) -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-4 col-lg-2">
          <div class="card text-center border-primary border-2 h-100">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold text-primary">{{ stats.users }}</div>
              <div class="small text-muted">Total Users</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-2">
          <div class="card text-center border-success border-2 h-100">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold text-success">{{ stats.seniors }}</div>
              <div class="small text-muted">Seniors</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-2">
          <div class="card text-center border-warning border-2 h-100">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold text-warning">{{ stats.caregivers }}</div>
              <div class="small text-muted">Caregivers</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-2">
          <div class="card text-center border-info border-2 h-100">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold text-info">{{ stats.bookings }}</div>
              <div class="small text-muted">Bookings</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-2">
          <div class="card text-center border-danger border-2 h-100">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold text-danger">{{ stats.pendingSupport }}</div>
              <div class="small text-muted">Pending Help</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-2">
          <div class="card text-center border-secondary border-2 h-100">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold text-secondary">{{ stats.contactMessages }}</div>
              <div class="small text-muted">Messages</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" v-for="tab in tabs" :key="tab.id" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
            role="tab"
            :aria-selected="activeTab === tab.id"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <!-- Tab: Overview -->
      <div v-if="activeTab === 'overview'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">System Overview</h2>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body">
                  <h3 class="h6">User Distribution</h3>
                  <div class="d-flex gap-4 mt-3">
                    <div class="text-center">
                      <div class="fs-4 fw-bold text-primary">{{ stats.seniors }}</div>
                      <div class="small">Seniors</div>
                    </div>
                    <div class="text-center">
                      <div class="fs-4 fw-bold text-warning">{{ stats.caregivers }}</div>
                      <div class="small">Caregivers</div>
                    </div>
                    <div class="text-center">
                      <div class="fs-4 fw-bold text-danger">{{ stats.admins }}</div>
                      <div class="small">Admins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card bg-light">
                <div class="card-body">
                  <h3 class="h6">Activity Summary</h3>
                  <ul class="list-unstyled mb-0 mt-2">
                    <li class="mb-2">✅ {{ stats.confirmedBookings }} confirmed bookings</li>
                    <li class="mb-2">🆘 {{ stats.pendingSupport }} pending support requests</li>
                    <li class="mb-2">✉️ {{ stats.contactMessages }} contact messages</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Users -->
      <div v-if="activeTab === 'users'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Registered Users ({{ users.length }})</h2>
          <div v-if="users.length === 0" class="text-center py-4 text-muted">No users registered yet.</div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" :key="u.id">
                  <td>{{ u.email }}</td>
                  <td>{{ u.displayName || '—' }}</td>
                  <td><span class="badge rounded-pill" :class="roleBadge(u.role)">{{ u.role }}</span></td>
                  <td class="small text-muted">{{ formatDate(u.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab: Bookings -->
      <div v-if="activeTab === 'bookings'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Event Bookings ({{ bookings.length }})</h2>
          <div v-if="bookings.length === 0" class="text-center py-4 text-muted">No bookings yet.</div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Event</th>
                  <th>Participant</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in bookings" :key="b.id">
                  <td>{{ b.eventTitle || '—' }}</td>
                  <td>{{ b.participantName }}</td>
                  <td>{{ b.participantPhone }}</td>
                  <td>
                    <span class="badge rounded-pill" :class="b.status === 'confirmed' ? 'bg-success' : 'bg-secondary'">
                      {{ b.status }}
                    </span>
                  </td>
                  <td class="small text-muted">{{ formatDate(b.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab: Support Requests -->
      <div v-if="activeTab === 'support'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Support Requests ({{ supportRequests.length }})</h2>
          <div v-if="supportRequests.length === 0" class="text-center py-4 text-muted">No support requests yet.</div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in supportRequests" :key="s.id">
                  <td>{{ s.name }}</td>
                  <td>{{ s.phone }}</td>
                  <td>
                    <span class="badge rounded-pill"
                      :class="s.urgency === 'emergency' ? 'bg-danger' : s.urgency === 'urgent' ? 'bg-warning text-dark' : 'bg-info'">
                      {{ s.urgency }}
                    </span>
                  </td>
                  <td><span class="badge rounded-pill" :class="s.status === 'pending' ? 'bg-warning text-dark' : 'bg-success'">{{ s.status }}</span></td>
                  <td class="small text-muted">{{ formatDate(s.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab: Contact Messages -->
      <div v-if="activeTab === 'messages'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Contact Messages ({{ contactMessages.length }})</h2>
          <div v-if="contactMessages.length === 0" class="text-center py-4 text-muted">No messages yet.</div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>From</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in contactMessages" :key="m.id">
                  <td>{{ m.name }}</td>
                  <td>{{ m.email }}</td>
                  <td>{{ m.subject || '—' }}</td>
                  <td class="small">{{ m.message?.substring(0, 80) }}{{ m.message?.length > 80 ? '...' : '' }}</td>
                  <td class="small text-muted">{{ formatDate(m.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
