<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import healthResourcesData from '@/data/healthResources.json'
import { useAccessibility } from '@/composables/useAccessibility'

const router = useRouter()
const { plainLanguage } = useAccessibility()
const resources = ref([])
const selectedCategory = ref('All')
const searchQuery = ref('')
const loading = ref(true)

const categories = computed(() => {
  const cats = ['All', ...new Set(resources.value.map(r => r.category))]
  return cats
})

const filteredResources = computed(() => {
  let result = resources.value
  if (selectedCategory.value !== 'All') {
    result = result.filter(r => r.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
  }
  return result
})

// Re-observe cards after filtering for scroll-reveal animation
let revealObserver = null

watch([filteredResources, selectedCategory, searchQuery], async () => {
  await nextTick()
  if (revealObserver) revealObserver.disconnect()
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el))
})

onMounted(() => {
  try {
    resources.value = healthResourcesData.resources
  } catch {
    resources.value = []
  }
  loading.value = false
})

function viewResource(id) {
  router.push('/health-resources/' + id)
}
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-3">📚 Health Resources</h1>
    <p class="lead text-muted mb-4">
      Expert-reviewed health guides in large, easy-to-read format. All content available in Plain Language.
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading health resources...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="resources.length === 0" class="text-center py-5">
      <p class="text-muted">No health resources are available at this time. Please check back soon.</p>
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-6 mb-3 mb-md-0">
          <label for="search-resources" class="form-label fw-bold">🔍 Search Resources</label>
          <input
            id="search-resources"
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Type keywords to search..."
            aria-label="Search health resources"
          />
        </div>
        <div class="col-md-6">
          <label for="category-filter" class="form-label fw-bold">📂 Filter by Category</label>
          <select id="category-filter" v-model="selectedCategory" class="form-select">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredResources.length === 0" class="text-center py-5">
        <p class="text-muted">No resources match your search. Try different keywords.</p>
      </div>

      <!-- Resource Cards -->
      <div class="row g-4">
        <div class="col-lg-6" v-for="res in filteredResources" :key="res.id">
          <div class="card h-100 shadow-sm reveal">
            <div class="card-body">
              <span class="badge bg-sb-blue mb-2">{{ res.category }}</span>
              <h2 class="card-title h4">{{ res.title }}</h2>
              <p class="card-text">
                {{ plainLanguage.plainLanguage && res.plainSummary ? res.plainSummary : res.summary }}
              </p>
              <p class="card-text"><small class="text-muted">Last updated: {{ res.lastUpdated }}</small></p>
            </div>
            <div class="card-footer bg-white border-top-0">
              <button class="btn btn-primary" @click="viewResource(res.id)">Read Article →</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
