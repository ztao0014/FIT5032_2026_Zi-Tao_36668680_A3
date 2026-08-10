<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import healthResourcesData from '@/data/healthResources.json'
import { useAccessibility } from '@/composables/useAccessibility'
import { sanitizeHtml } from '@/utils/sanitize'

const route = useRoute()
const { plainLanguage } = useAccessibility()
const resource = ref(null)
const notFound = ref(false)

const displayContent = computed(() => {
  if (!resource.value) return ''
  return sanitizeHtml(resource.value.content)
})

function printArticle() {
  window.print()
}

onMounted(() => {
  const id = route.params.id
  const found = healthResourcesData.resources.find(r => r.id === id)
  if (found) {
    resource.value = found
  } else {
    notFound.value = true
  }
})
</script>

<template>
  <div class="container py-5">
    <!-- Not Found -->
    <div v-if="notFound" class="text-center py-5">
      <h1>Article Not Found</h1>
      <p class="text-muted">The health resource you are looking for does not exist.</p>
      <router-link to="/health-resources" class="btn btn-primary">← Back to Health Resources</router-link>
    </div>

    <!-- Resource Detail -->
    <template v-if="resource">
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><router-link to="/health-resources">Health Resources</router-link></li>
          <li class="breadcrumb-item active" aria-current="page">{{ resource.title }}</li>
        </ol>
      </nav>

      <article>
        <span class="badge bg-sb-blue mb-2">{{ resource.category }}</span>
        <h1>{{ resource.title }}</h1>
        <p class="text-muted"><em>Last updated: {{ resource.lastUpdated }}</em></p>

        <div class="alert alert-info d-flex align-items-center gap-2 my-4" role="region" aria-label="Plain language option">
          <span>💡</span>
          <span><strong>Plain Language Summary:</strong> {{ resource.plainSummary }}</span>
        </div>

        <!-- Full Content -->
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div v-html="displayContent" class="resource-content"></div>
          </div>
        </div>
      </article>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <router-link to="/health-resources" class="btn btn-outline-primary btn-lg">← Back to All Resources</router-link>
        <button class="btn btn-outline-secondary btn-lg" @click="printArticle" title="Print this article in large font">
          🖨️ Print This Article
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.resource-content {
  font-size: calc(1.125rem * var(--font-scale));
  line-height: 1.8;
}
.resource-content h2 {
  margin-top: 1.5rem;
  color: var(--sb-blue);
}
.resource-content ul, .resource-content ol {
  padding-left: 1.5rem;
}
</style>
