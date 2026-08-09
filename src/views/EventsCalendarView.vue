<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import eventsData from '@/data/events.json'

const router = useRouter()

const currentDate = ref(new Date())
const events = ref([])
const selectedDate = ref(null)
const selectedDateEvents = ref([])

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonth = computed(() => monthNames[currentDate.value.getMonth()])
const currentYear = computed(() => currentDate.value.getFullYear())

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days = []

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, month: 'prev', date: new Date(year, month - 1, daysInPrevMonth - i) })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month: 'current', date: new Date(year, month, i), isToday: isToday(year, month, i) })
  }

  // Next month fill
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: 'next', date: new Date(year, month + 1, i) })
  }

  return days
})

function isToday(year, month, day) {
  const today = new Date()
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
}

function getEventsForDate(date) {
  return events.value.filter(e => {
    const ed = new Date(e.date)
    return ed.getFullYear() === date.getFullYear() && ed.getMonth() === date.getMonth() && ed.getDate() === date.getDate()
  })
}

function hasEvents(date) {
  return getEventsForDate(date).length > 0
}

function selectDate(day) {
  if (day.month !== 'current') return
  selectedDate.value = day.date
  selectedDateEvents.value = getEventsForDate(day.date)
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  selectedDate.value = null
  selectedDateEvents.value = []
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  selectedDate.value = null
  selectedDateEvents.value = []
}

function goToEvent(id) {
  router.push('/events/' + id)
}

function formatDate(date) {
  return date.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
  events.value = eventsData.events
})
</script>

<template>
  <div class="container py-5">
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><router-link to="/events">Events</router-link></li>
        <li class="breadcrumb-item active" aria-current="page">Calendar View</li>
      </ol>
    </nav>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-0">📅 Events Calendar</h1>
        <p class="text-muted mb-0">View upcoming events by date. <strong>Orange dots</strong> indicate event days.</p>
      </div>
      <router-link to="/events" class="btn btn-outline-primary">📋 List View</router-link>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <!-- Calendar Navigation -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <button class="btn btn-outline-primary" @click="prevMonth" aria-label="Previous month">← Previous</button>
          <h2 class="h4 mb-0">{{ currentMonth }} {{ currentYear }}</h2>
          <button class="btn btn-outline-primary" @click="nextMonth" aria-label="Next month">Next →</button>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid mb-4" role="grid" aria-label="Monthly calendar view">
          <div class="calendar-header" v-for="d in dayNames" :key="d" role="columnheader">
            {{ d }}
          </div>
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="calendar-cell"
            :class="{
              'prev-next': day.month !== 'current',
              'today': day.isToday,
              'has-events': day.month === 'current' && hasEvents(day.date),
              'selected': selectedDate && day.month === 'current' && day.date.toDateString() === selectedDate.toDateString(),
            }"
            role="gridcell"
            :aria-label="day.date.toDateString()"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.day }}</span>
            <span v-if="day.month === 'current' && hasEvents(day.date)" class="event-dot" aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <!-- Selected Date Events -->
      <div class="col-lg-4">
        <div class="card shadow-sm sticky-top" style="top: 100px;">
          <div class="card-body">
            <h3 class="h5 mb-3">
              {{ selectedDate ? formatDate(selectedDate) : 'Select a Date' }}
            </h3>

            <div v-if="!selectedDate" class="text-center py-4 text-muted">
              <div style="font-size: 3rem;">📅</div>
              <p class="mt-2">Click a highlighted date on the calendar to see events.</p>
            </div>

            <div v-else-if="selectedDateEvents.length === 0" class="text-center py-4 text-muted">
              <p>No events scheduled for this date.</p>
            </div>

            <div v-else>
              <div
                v-for="event in selectedDateEvents"
                :key="event.id"
                class="card mb-2"
                style="cursor: pointer;"
                @click="goToEvent(event.id)"
              >
                <div class="card-body py-2 px-3">
                  <span class="badge rounded-pill mb-1" style="background: var(--sb-primary); font-size: 0.7rem;">{{ event.category }}</span>
                  <h4 class="h6 mb-1">{{ event.title }}</h4>
                  <p class="small text-muted mb-0">⏰ {{ event.time }} | 📍 {{ event.location }}</p>
                  <p class="small mb-0">
                    <span :class="event.spotsLeft > 0 ? 'text-success' : 'text-danger'">
                      {{ event.spotsLeft > 0 ? event.spotsLeft + ' spots left' : 'Fully booked' }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #dee2e6;
}

.calendar-header {
  background: var(--sb-primary);
  color: #fff;
  padding: 10px 4px;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.calendar-cell {
  background: #fff;
  min-height: 90px;
  padding: 8px;
  cursor: pointer;
  position: relative;
  transition: background 0.15s;
}

.calendar-cell:hover {
  background: #e9ecef;
}

.calendar-cell.prev-next {
  opacity: 0.35;
  cursor: default;
}

.calendar-cell.today {
  background: #fff8e1;
}

.calendar-cell.today .day-number {
  background: var(--sb-accent);
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.calendar-cell.selected {
  background: #cce5ff;
  border: 2px solid var(--sb-primary);
}

.day-number {
  font-size: 0.95rem;
  font-weight: 600;
}

.event-dot {
  display: block;
  width: 8px;
  height: 8px;
  background: var(--sb-accent);
  border-radius: 50%;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .calendar-cell {
    min-height: 60px;
    padding: 4px;
  }
  .calendar-header {
    font-size: 0.7rem;
    padding: 6px 2px;
  }
}
</style>
