import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

// Bootstrap 5 CSS & JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Custom global styles (overrides Bootstrap where needed)
import './assets/main.css'
import './assets/accessibility.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize Firebase auth listener BEFORE mounting
// This ensures auth state is restored before router guard fires
const authStore = useAuthStore()
await authStore.initAuthListener()

app.mount('#app')
