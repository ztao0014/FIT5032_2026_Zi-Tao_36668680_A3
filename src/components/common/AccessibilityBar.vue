<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAccessibility } from '@/composables/useAccessibility'

const { plainLanguage, togglePlainLanguage } = useAccessibility()

// Persist accessibility settings in localStorage
const fontSize = ref(loadPreference('sb-font-size', 'default'))
const highContrast = ref(loadPreference('sb-high-contrast', false))

function loadPreference(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored !== null ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage may be full or unavailable
  }
}

// Apply font size class to <html>
function applyFontSize() {
  document.documentElement.classList.remove('font-medium', 'font-large', 'font-xlarge')
  if (fontSize.value !== 'default') {
    document.documentElement.classList.add('font-' + fontSize.value)
  }
  savePreference('sb-font-size', fontSize.value)
}

// Apply high contrast mode to <body>
function applyContrast() {
  document.body.classList.toggle('high-contrast', highContrast.value)
  savePreference('sb-high-contrast', highContrast.value)
}

function cycleFontSize() {
  const sizes = ['default', 'medium', 'large', 'xlarge']
  const idx = sizes.indexOf(fontSize.value)
  fontSize.value = sizes[(idx + 1) % sizes.length]
  applyFontSize()
}

const fontLabelMap = { default: 'A', medium: 'A+', large: 'A++', xlarge: 'A+++' }

watch(highContrast, applyContrast)

onMounted(() => {
  applyFontSize()
  applyContrast()
})
</script>

<template>
  <div
    class="accessibility-bar bg-light border-bottom py-1"
    role="region"
    aria-label="Accessibility controls"
  >
    <div class="container d-flex justify-content-end align-items-center gap-2 flex-wrap">
      <span class="small text-muted me-2"><strong>Accessibility:</strong></span>

      <!-- Font Size -->
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="cycleFontSize"
        :aria-label="'Font size: ' + fontLabelMap[fontSize] + '. Click to change.'"
      >
        {{ fontLabelMap[fontSize] }}
      </button>

      <!-- High Contrast Toggle -->
      <button
        class="btn btn-sm"
        :class="highContrast ? 'btn-dark' : 'btn-outline-dark'"
        @click="highContrast = !highContrast; applyContrast()"
        :aria-label="'High contrast mode: ' + (highContrast ? 'on' : 'off') + '. Click to toggle.'"
        :aria-pressed="highContrast"
      >
        {{ highContrast ? '◐ HIGH CONTRAST' : '◑ High Contrast' }}
      </button>

      <!-- Plain Language Toggle -->
      <button
        class="btn btn-sm"
        :class="plainLanguage.plainLanguage ? 'btn-success' : 'btn-outline-success'"
        @click="togglePlainLanguage"
        :aria-label="'Plain language mode: ' + (plainLanguage.plainLanguage ? 'on' : 'off') + '. Click to toggle.'"
        :aria-pressed="plainLanguage.plainLanguage"
      >
        {{ plainLanguage.plainLanguage ? '✓ Plain Language' : 'Plain Language' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.accessibility-bar .btn {
  font-size: 0.85rem;
  min-height: 36px;
}
</style>
