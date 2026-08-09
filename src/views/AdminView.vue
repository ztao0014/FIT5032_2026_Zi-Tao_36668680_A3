<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import DataTable from '@/components/common/DataTable.vue'
import BulkEmailPanel from '@/components/admin/BulkEmailPanel.vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Chart instances for cleanup
let roleChart = null
let bookingChart = null

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

const tabs = computed(() => [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: `👥 Users (${users.value.length})` },
  { id: 'bookings', label: `📅 Bookings (${bookings.value.length})` },
  { id: 'support', label: `📩 Support (${supportRequests.value.length})` },
  { id: 'messages', label: `✉️ Messages (${contactMessages.value.length})` },
  { id: 'bulk-email', label: `📧 Bulk Email` },
])

// Chart data
const roleChartData = computed(() => ({
  labels: ['Seniors', 'Caregivers', 'Admins'],
  datasets: [{
    label: 'Users by Role',
    data: [stats.value.seniors, stats.value.caregivers, stats.value.admins],
    backgroundColor: ['#2c5f8a', '#e8913a', '#dc3545'],
    borderWidth: 0,
    borderRadius: 6,
  }],
}))

const bookingStatusData = computed(() => ({
  labels: ['Confirmed', 'Pending'],
  datasets: [{
    data: [stats.value.confirmedBookings, stats.value.bookings - stats.value.confirmedBookings],
    backgroundColor: ['#198754', '#ffc107'],
    borderWidth: 0,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
}

// --- DataTable column definitions ---
const userColumns = [
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'displayName', label: 'Name', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true, searchable: true },
  { key: 'phone', label: 'Phone', sortable: false, searchable: true },
  { key: 'createdAt', label: 'Registered', sortable: true, searchable: false },
  { key: 'actions', label: 'Actions', sortable: false, searchable: false },
]

const bookingColumns = [
  { key: 'eventTitle', label: 'Event', sortable: true, searchable: true },
  { key: 'participantName', label: 'Participant', sortable: true, searchable: true },
  { key: 'participantPhone', label: 'Phone', sortable: true, searchable: true },
  { key: 'participantEmail', label: 'Email', sortable: true, searchable: true },
  { key: 'status', label: 'Status', sortable: true, searchable: true },
  { key: 'createdAt', label: 'Date', sortable: true, searchable: false },
]

const supportColumns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'phone', label: 'Phone', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'urgency', label: 'Urgency', sortable: true, searchable: true },
  { key: 'status', label: 'Status', sortable: true, searchable: true },
  { key: 'createdAt', label: 'Date', sortable: true, searchable: false },
]

const messageColumns = [
  { key: 'name', label: 'From', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'subject', label: 'Subject', sortable: true, searchable: true },
  { key: 'message', label: 'Message', sortable: true, searchable: true },
  { key: 'createdAt', label: 'Date', sortable: true, searchable: false },
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

async function deleteUser(userId) {
  if (!confirm('Delete this user account? This action cannot be undone.')) return
  try {
    await deleteDoc(doc(db, 'users', userId))
    users.value = users.value.filter(u => u.id !== userId)
  } catch (err) {
    console.error('Delete user failed:', err)
    alert('Failed to delete user: ' + err.message)
  }
}

async function renderCharts() {
  await nextTick()
  // Destroy old charts
  if (roleChart) { roleChart.destroy(); roleChart = null }
  if (bookingChart) { bookingChart.destroy(); bookingChart = null }

  const roleCanvas = document.getElementById('roleChartCanvas')
  const bookingCanvas = document.getElementById('bookingChartCanvas')

  if (roleCanvas) {
    roleChart = new Chart(roleCanvas, {
      type: 'bar',
      data: {
        labels: ['Seniors', 'Caregivers', 'Admins'],
        datasets: [{
          label: 'Users by Role',
          data: [stats.value.seniors, stats.value.caregivers, stats.value.admins],
          backgroundColor: ['#2c5f8a', '#e8913a', '#dc3545'],
          borderWidth: 0,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    })
  }

  if (bookingCanvas) {
    bookingChart = new Chart(bookingCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Confirmed', 'Other'],
        datasets: [{
          data: [stats.value.confirmedBookings, Math.max(0, stats.value.bookings - stats.value.confirmedBookings)],
          backgroundColor: ['#198754', '#ffc107'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    })
  }
}

// Watch tab changes to render charts when Overview tab is selected
watch(activeTab, async (tab) => {
  if (tab === 'overview') await renderCharts()
})

// Watch for data load
watch(stats, async () => {
  if (activeTab.value === 'overview') await renderCharts()
})

onMounted(async () => {
  await loadAllData()
})
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-2">🛡️ Admin Dashboard</h1>
    <p class="text-muted mb-4">System overview, data management, and administrative tools</p>

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
      <!-- Stats Cards -->
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
      <ul class="nav nav-tabs mb-4 flex-wrap" role="tablist">
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
      <div v-if="activeTab === 'overview'">
        <div class="row g-4 mb-4">
          <!-- User Role Chart -->
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-body">
                <h2 class="h5 mb-3">📊 User Distribution by Role</h2>
                <div style="height: 260px;">
                  <canvas id="roleChartCanvas"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Status Chart -->
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-body">
                <h2 class="h5 mb-3">🍩 Booking Status</h2>
                <div style="height: 260px;">
                  <canvas id="bookingChartCanvas"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
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

      <!-- Tab: Users -->
      <div v-if="activeTab === 'users'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Registered Users ({{ users.length }})</h2>
          <DataTable
            :columns="userColumns"
            :rows="users"
            :page-size="10"
            table-id="admin-users"
            search-placeholder="Search users by email, name, role..."
          >
            <template #cell-role="{ row }">
              <span class="badge rounded-pill" :class="roleBadge(row.role)">{{ row.role }}</span>
            </template>
            <template #cell-createdAt="{ value }">
              <span class="small text-muted">{{ formatDate(value) }}</span>
            </template>
            <template #cell-actions="{ row }">
              <button
                v-if="row.role !== 'admin'"
                class="btn btn-outline-danger btn-sm"
                @click="deleteUser(row.id)"
                title="Delete user"
              >
                🗑
              </button>
              <span v-else class="text-muted small">—</span>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Tab: Bookings -->
      <div v-if="activeTab === 'bookings'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Event Bookings ({{ bookings.length }})</h2>
          <DataTable
            :columns="bookingColumns"
            :rows="bookings"
            :page-size="10"
            table-id="admin-bookings"
            search-placeholder="Search bookings by event, participant..."
          >
            <template #cell-status="{ value }">
              <span class="badge rounded-pill" :class="value === 'confirmed' ? 'bg-success' : 'bg-secondary'">
                {{ value }}
              </span>
            </template>
            <template #cell-createdAt="{ value }">
              <span class="small text-muted">{{ formatDate(value) }}</span>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Tab: Support -->
      <div v-if="activeTab === 'support'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Support Requests ({{ supportRequests.length }})</h2>
          <DataTable
            :columns="supportColumns"
            :rows="supportRequests"
            :page-size="10"
            table-id="admin-support"
            search-placeholder="Search support requests..."
          >
            <template #cell-urgency="{ value }">
              <span class="badge rounded-pill"
                :class="value === 'emergency' ? 'bg-danger' : value === 'urgent' ? 'bg-warning text-dark' : 'bg-info'">
                {{ value }}
              </span>
            </template>
            <template #cell-status="{ value }">
              <span class="badge rounded-pill" :class="value === 'pending' ? 'bg-warning text-dark' : 'bg-success'">{{ value }}</span>
            </template>
            <template #cell-createdAt="{ value }">
              <span class="small text-muted">{{ formatDate(value) }}</span>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Tab: Messages -->
      <div v-if="activeTab === 'messages'" class="card">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Contact Messages ({{ contactMessages.length }})</h2>
          <DataTable
            :columns="messageColumns"
            :rows="contactMessages"
            :page-size="10"
            table-id="admin-messages"
            search-placeholder="Search messages by name, email, subject..."
          >
            <template #cell-message="{ value }">
              <span class="small">{{ value?.substring(0, 80) }}{{ value?.length > 80 ? '...' : '' }}</span>
            </template>
            <template #cell-createdAt="{ value }">
              <span class="small text-muted">{{ formatDate(value) }}</span>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Tab: Bulk Email -->
      <div v-if="activeTab === 'bulk-email'" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-body p-4">
              <BulkEmailPanel :users="users" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
