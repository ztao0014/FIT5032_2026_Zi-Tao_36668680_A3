<script setup>
// Current year for copyright
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer bg-sb-dark text-white py-4 mt-auto" role="contentinfo">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-3 mb-lg-0">
          <h5 class="text-sb-gold">SilverBridge Health</h5>
          <p class="mb-0 small">
            Supporting the physical and mental well-being of elderly populations across Australia.
          </p>
        </div>
        <div class="col-lg-4 mb-3 mb-lg-0">
          <h6 class="text-sb-gold">Quick Links</h6>
          <ul class="list-unstyled small">
            <li><router-link to="/about" class="text-white text-decoration-none">About Us</router-link></li>
            <li><router-link to="/contact" class="text-white text-decoration-none">Contact</router-link></li>
            <li><router-link to="/get-support" class="text-white text-decoration-none">Get Support</router-link></li>
          </ul>
        </div>
        <div class="col-lg-4">
          <h6 class="text-sb-gold">Contact Info</h6>
          <address class="small mb-0">
            📞 Emergency Support: <strong>1800-SILVER</strong><br />
            📧 Email: help@silverbridgehealth.org.au<br />
            📍 Level 5, 200 Collins Street, Melbourne VIC 3000
          </address>
        </div>
      </div>
      <hr class="my-3 border-secondary" />
      <p class="text-center small mb-0">
        &copy; {{ currentYear }} SilverBridge Health. All rights reserved. ABN 12 345 678 901.
      </p>
    </div>
  </footer>
</template>
