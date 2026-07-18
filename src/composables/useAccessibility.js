import { reactive } from 'vue'

// Shared reactive state across all components
const state = reactive({
  plainLanguage: loadPref('sb-plain-language', false),
})

function loadPref(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored !== null ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function savePref(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

export function useAccessibility() {
  function togglePlainLanguage() {
    state.plainLanguage = !state.plainLanguage
    savePref('sb-plain-language', state.plainLanguage)
  }

  function isPlainLanguage() {
    return state.plainLanguage
  }

  return {
    plainLanguage: state,
    togglePlainLanguage,
    isPlainLanguage,
  }
}
