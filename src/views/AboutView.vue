<script setup>
const mission = {
  title: 'Our Mission',
  text: 'SilverBridge Health is a distinguished charity dedicated to improving the physical and mental well-being of elderly populations across Australia. Since our founding in 2010, we have helped over 50,000 seniors stay connected, active, and independent.',
}

const values = [
  { icon: '❤️', title: 'Compassion', text: 'We treat every person with dignity, respect, and genuine care.' },
  { icon: '🤝', title: 'Community', text: 'We build bridges — not just between services, but between people.' },
  { icon: '🔍', title: 'Accessibility', text: 'We believe everyone deserves equal access to health information and support.' },
  { icon: '💡', title: 'Innovation', text: 'We embrace technology to solve real problems for real people.' },
]
</script>

<template>
  <div class="container py-5">
    <div class="text-center mb-5">
      <h1 class="display-5 fw-bold">About SilverBridge Health</h1>
      <p class="lead text-muted">Bridging the gap between seniors, caregivers, and community support since 2010.</p>
    </div>

    <div class="row mb-5 align-items-center">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <h2>{{ mission.title }}</h2>
        <p class="text-large">{{ mission.text }}</p>
        <ul class="list-unstyled">
          <li>✅ Over 50,000 seniors supported</li>
          <li>✅ 200+ community events per year</li>
          <li>✅ 24/7 helpline with qualified support coordinators</li>
          <li>✅ 100+ free health resources in plain language</li>
        </ul>
      </div>
      <div class="col-lg-6 text-center">
        <div class="bg-sb-blue text-white rounded-3 p-5 d-inline-block">
          <div style="font-size: 5rem;">🏥</div>
          <p class="fw-bold mt-2">Serving Australian Seniors</p>
        </div>
      </div>
    </div>

    <h2 class="text-center mb-4">Our Values</h2>
    <div class="row g-4 mb-5">
      <div class="col-md-6 col-lg-3" v-for="v in values" :key="v.title">
        <div class="card h-100 shadow-sm text-center">
          <div class="card-body">
            <div style="font-size: 2.5rem;">{{ v.icon }}</div>
            <h3 class="card-title h5">{{ v.title }}</h3>
            <p class="card-text small">{{ v.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <h2 class="mb-3">Annual Reports</h2>
    <div class="list-group">
      <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
        📄 Annual Report 2024-2025
        <span class="badge bg-primary rounded-pill">New</span>
      </a>
      <a href="#" class="list-group-item list-group-item-action">📄 Annual Report 2023-2024</a>
      <a href="#" class="list-group-item list-group-item-action">📄 Annual Report 2022-2023</a>
    </div>
  </div>
</template>
