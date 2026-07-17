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
    saveMessage.value = 'Failed to update profile.'
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
                @click="isEditing = true"
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
                <button type="button" class="btn btn-outline-secondary" @click="isEditing = false">
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
          <div class="card-body">
            <h2 class="h5">My Bookings</h2>
            <p class="text-muted mb-0">You have no upcoming bookings.</p>
            <router-link to="/events" class="btn btn-primary mt-3">Browse Events →</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
