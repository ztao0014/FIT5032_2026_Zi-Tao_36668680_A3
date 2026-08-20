<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const picking = ref(false)
const errorMessage = ref('')

async function choose(role) {
  picking.value = true
  errorMessage.value = ''
  try {
    await authStore.updateUserRole(role)
  } catch {
    errorMessage.value = authStore.error || 'Failed to set your role. Please try again.'
  } finally {
    picking.value = false
  }
}
</script>

<template>
  <div class="role-modal-backdrop">
    <div class="role-modal" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <h2 id="role-modal-title" class="h4 mb-2">👋 Welcome to SilverBridge Health!</h2>
      <p class="text-muted mb-4">How would you like to use the site?</p>

      <div v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

      <button
        class="btn btn-primary btn-lg w-100 mb-2"
        :disabled="picking"
        @click="choose('senior')"
      >
        🧓 I'm a Senior (65+)
      </button>
      <button
        class="btn btn-warning btn-lg w-100"
        :disabled="picking"
        @click="choose('caregiver')"
      >
        👨‍👩‍👦 I'm a Caregiver / Family Member
      </button>

      <p class="text-muted small text-center mt-3 mb-0">You can change this later in your profile.</p>
    </div>
  </div>
</template>

<style scoped>
.role-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 30, 45, 0.6);
}
.role-modal {
  width: 100%;
  max-width: 440px;
  padding: 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
}
</style>
