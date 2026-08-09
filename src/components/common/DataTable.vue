<script setup>
import { ref, computed, watch } from 'vue'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },
  searchPlaceholder: { type: String, default: 'Search...' },
  striped: { type: Boolean, default: true },
  hover: { type: Boolean, default: true },
  tableId: { type: String, default: 'data-table' },
})

const emit = defineEmits(['row-click', 'export-csv'])

// Search & Sort State
const globalSearch = ref('')
const columnSearch = ref({})
const sortKey = ref('')
const sortDir = ref('asc')
const currentPage = ref(1)

// Initialize column search
props.columns.forEach(col => {
  if (col.searchable !== false) {
    columnSearch.value[col.key] = ''
  }
})

// Computed filtered data
const filteredRows = computed(() => {
  let result = [...props.rows]

  // Global search
  if (globalSearch.value.trim()) {
    const q = globalSearch.value.toLowerCase()
    result = result.filter(row => {
      return props.columns.some(col => {
        const val = String(row[col.key] ?? '').toLowerCase()
        return val.includes(q)
      })
    })
  }

  // Column-specific search
  props.columns.forEach(col => {
    const colQ = columnSearch.value[col.key]
    if (colQ && colQ.trim()) {
      const q = colQ.toLowerCase()
      result = result.filter(row => {
        const val = String(row[col.key] ?? '').toLowerCase()
        return val.includes(q)
      })
    }
  })

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = a[sortKey.value] ?? ''
      const bVal = b[sortKey.value] ?? ''
      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / props.pageSize)))
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return filteredRows.value.slice(start, start + props.pageSize)
})
const showingStart = computed(() => filteredRows.value.length === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1)
const showingEnd = computed(() => Math.min(currentPage.value * props.pageSize, filteredRows.value.length))

// Reset page when filter changes
watch([globalSearch, columnSearch], () => {
  currentPage.value = 1
})

function toggleSort(key) {
  const col = props.columns.find(c => c.key === key)
  if (col && col.sortable === false) return
  if (sortKey.value === key) {
    if (sortDir.value === 'asc') sortDir.value = 'desc'
    else if (sortDir.value === 'desc') { sortKey.value = ''; sortDir.value = 'asc' }
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function sortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

// Build page number array
const pageNumbers = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = currentPage.value
  let start = Math.max(1, cp - 2)
  let end = Math.min(tp, cp + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(tp, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function handleRowClick(row) {
  emit('row-click', row)
}

// Export to CSV
function exportCSV() {
  const headers = props.columns.map(c => c.label).join(',')
  const csvRows = filteredRows.value.map(row =>
    props.columns.map(c => {
      let val = String(row[c.key] ?? '').replace(/"/g, '""')
      return `"${val}"`
    }).join(',')
  )
  const csv = [headers, ...csvRows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.tableId}-export.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Export to PDF
function exportPDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const title = props.tableId.replace(/-/g, ' ').toUpperCase()

  // Title
  doc.setFontSize(14)
  doc.text(title, 40, 40)

  // Table headers
  const headers = props.columns.map(c => c.label)
  const data = filteredRows.value.map(row =>
    props.columns.map(c => String(row[c.key] ?? ''))
  )

  doc.autoTable({
    head: [headers],
    body: data,
    startY: 55,
    margin: 40,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [44, 95, 138], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
  })

  doc.save(`${props.tableId}-export.pdf`)
}

defineExpose({ exportCSV, filteredRows })
</script>

<template>
  <div class="datatable">
    <!-- Toolbar: Global Search + Export -->
    <div class="row mb-3 align-items-end">
      <div class="col-md-6 mb-2 mb-md-0">
        <label :for="tableId + '-search'" class="form-label fw-bold small">🔍 Search</label>
        <input
          :id="tableId + '-search'"
          v-model="globalSearch"
          type="text"
          class="form-control"
          :placeholder="searchPlaceholder"
          :aria-label="'Search ' + tableId"
        />
      </div>
      <div class="col-md-6 text-md-end">
        <button class="btn btn-outline-secondary btn-sm me-1" @click="exportCSV" title="Export to CSV">
          📥 CSV
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="exportPDF" title="Export to PDF">
          📄 PDF
        </button>
      </div>
    </div>

    <!-- Column Search Row -->
    <div class="row mb-2 g-2" v-if="columns.some(c => c.searchable !== false)">
      <div class="col" v-for="col in columns" :key="'search-' + col.key">
        <input
          v-if="col.searchable !== false"
          v-model="columnSearch[col.key]"
          type="text"
          class="form-control form-control-sm"
          :placeholder="'Search ' + col.label"
          :aria-label="'Search by ' + col.label"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table
        class="table"
        :class="{ 'table-striped': striped, 'table-hover': hover }"
        :aria-label="tableId"
      >
        <thead class="table-light">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="{ 'sortable-header': col.sortable !== false }"
              :style="col.sortable !== false ? 'cursor:pointer; user-select:none;' : ''"
              :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="col.sortable !== false" class="sort-icon ms-1">{{ sortIcon(col.key) }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length" class="text-center py-4 text-muted">
              No data found matching your search criteria.
            </td>
          </tr>
          <tr
            v-for="(row, idx) in paginatedRows"
            :key="row.id || idx"
            @click="handleRowClick(row)"
            :style="$attrs.onRowClick ? 'cursor:pointer;' : ''"
          >
            <td v-for="col in columns" :key="col.key" :data-label="col.label">
              <slot :name="'cell-' + col.key" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3" v-if="filteredRows.length > 0">
      <div class="small text-muted">
        Showing {{ showingStart }} to {{ showingEnd }} of {{ filteredRows.length }} entries
      </div>

      <nav aria-label="Table pagination">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)" aria-label="Previous page">«</button>
          </li>
          <li class="page-item" v-if="pageNumbers[0] > 1">
            <button class="page-link" @click="goToPage(1)">1</button>
          </li>
          <li class="page-item disabled" v-if="pageNumbers[0] > 2"><span class="page-link">…</span></li>
          <li
            class="page-item"
            v-for="p in pageNumbers"
            :key="p"
            :class="{ active: p === currentPage }"
          >
            <button class="page-link" @click="goToPage(p)">{{ p }}</button>
          </li>
          <li class="page-item disabled" v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1"><span class="page-link">…</span></li>
          <li class="page-item" v-if="pageNumbers[pageNumbers.length - 1] < totalPages">
            <button class="page-link" @click="goToPage(totalPages)">{{ totalPages }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(currentPage + 1)" aria-label="Next page">»</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.datatable .table th {
  white-space: nowrap;
  vertical-align: middle;
}
.sortable-header:hover {
  background-color: #e9ecef;
}
.sort-icon {
  font-size: 0.75rem;
  opacity: 0.5;
}
.page-link {
  cursor: pointer;
  min-height: 38px;
  display: flex;
  align-items: center;
}
.table td {
  vertical-align: middle;
}
</style>
