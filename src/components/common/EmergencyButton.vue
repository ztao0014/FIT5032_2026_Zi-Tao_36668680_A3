<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToSupport() {
  router.push('/get-support')
}
</script>

<template>
  <button
    class="btn btn-danger emergency-btn d-flex flex-column align-items-center justify-content-center"
    @click="goToSupport"
    aria-label="Emergency support — Get help now"
    title="Emergency Support"
  >
    <span style="font-size: 1.8rem;">🆘</span>
    <span style="font-size: 0.8rem; letter-spacing: 1px;">HELP</span>
  </button>
</template>
