<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const authStore = useAuthStore()

const profile = ref({
  displayName: '',
  phone: '',
  email: '',
})

const isEditing = ref(false)
const isSaving = ref(false)
const saveMessage = ref('')
const saveError = ref('')
const originalProfile = ref({ displayName: '', phone: '' })

function startEditing() {
  // Cache current values before editing
  originalProfile.value = { ...profile.value }
  isEditing.value = true
}

function cancelEditing() {
  // Restore original values on cancel
  profile.value.displayName = originalProfile.value.displayName
  profile.value.phone = originalProfile.value.phone
  isEditing.value = false
  saveError.value = ''
}

onMounted(async () => {
  profile.value.email = authStore.user?.email || ''
  if (authStore.userId) {
    try {
      const snap = await getDoc(doc(db, 'users', authStore.userId))
      if (snap.exists()) {
        const data = snap.data()
        profile.value.displayName = data.displayName || ''
        profile.value.phone = data.phone || ''
      }
    } catch { /* ignore */ }
  }
})

async function saveProfile() {
  saveError.value = ''
  isSaving.value = true
  try {
    await updateDoc(doc(db, 'users', authStore.userId), {
      displayName: profile.value.displayName,
      phone: profile.value.phone,
    })
    isEditing.value = false
    saveMessage.value = 'Profile updated successfully!'
    setTimeout(() => { saveMessage.value = '' }, 3000)
  } catch {
    saveError.value = 'Failed to update profile. Please try again.'
  } finally {
    isSaving.value = false
  }
}

const roleLabel = computed(() => {
  const map = { senior: '🧓 Senior', caregiver: '👨‍👩‍👦 Caregiver', admin: '🛡️ Admin' }
  return map[authStore.userRole] || authStore.userRole
})
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h1>👤 My Profile</h1>
        <p class="text-muted mb-4">Manage your personal information and account settings.</p>

        <div v-if="saveMessage" class="alert alert-success">{{ saveMessage }}</div>
        <div v-if="saveError" class="alert alert-danger">{{ saveError }}</div>

        <!-- Account Info -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h2 class="h5">Account Information</h2>
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><strong>Email:</strong> {{ profile.email }}</li>
              <li class="mb-2"><strong>Role:</strong> {{ roleLabel }}</li>
              <li class="mb-2">
                <strong>Account Created:</strong>
                {{ authStore.user?.metadata?.creationTime || 'Unknown' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Personal Details -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h5 mb-0">Personal Details</h2>
              <button
                v-if="!isEditing"
                class="btn btn-outline-primary btn-sm"
                @click="startEditing"
              >
                ✏️ Edit
              </button>
            </div>

            <form v-if="isEditing" @submit.prevent="saveProfile" novalidate>
              <div class="mb-3">
                <label for="profile-name" class="form-label">Display Name</label>
                <input id="profile-name" v-model="profile.displayName" type="text" class="form-control" placeholder="Enter your name" />
              </div>
              <div class="mb-3">
                <label for="profile-phone" class="form-label">Phone Number</label>
                <input id="profile-phone" v-model="profile.phone" type="tel" class="form-control" placeholder="0412 345 678" />
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  {{ isSaving ? 'Saving...' : '💾 Save Changes' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="cancelEditing">
                  Cancel
                </button>
              </div>
            </form>

            <template v-else>
              <p><strong>Name:</strong> {{ profile.displayName || 'Not set' }}</p>
              <p class="mb-0"><strong>Phone:</strong> {{ profile.phone || 'Not set' }}</p>
            </template>
          </div>
        </div>

        <!-- My Bookings -->
        <div class="card shadow-sm">
          <div class="card-body text-center py-4">
            <div style="font-size: 2.5rem;">📋</div>
            <h2 class="h5 mt-2">My Bookings</h2>
            <p class="text-muted">You don't have any upcoming bookings yet.</p>
            <p class="small text-muted">Browse our community events and find something you'll enjoy!</p>
            <router-link to="/events" class="btn btn-primary btn-lg mt-2">
              📅 Browse Events →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
