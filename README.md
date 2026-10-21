# SilverBridge Health — Supporting Seniors Across Australia

A web application that helps seniors and their caregivers discover health resources, book community events, and request support — while giving administrators a single dashboard to manage bookings, support requests, and enquiries.

This project was developed for **FIT5032** (Monash University, 2026).

- **Live site:** https://silverbridge-health.web.app
- **Firebase project:** `silverbridge-health`

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Firebase setup](#firebase-setup)
- [Cloud Functions](#cloud-functions)
- [Deployment](#deployment)
- [Available scripts](#available-scripts)
- [Security rules](#security-rules)

---

## Features

**Three user roles** — senior, caregiver, and admin — each with their own access level, enforced by client-side route guards and Firestore security rules.

### For seniors & caregivers
- **Health Resources** — a searchable library of health articles with category filtering and detailed views.
- **Events** — browse, view details, book a spot, and see an interactive calendar.
- **Event ratings** — attendees rate events; averages are aggregated in real time.
- **Caregiver directory** — find caregivers, shown on an interactive map.
- **Get Support** — submit a support request that admins can act on.
- **Contact form** — send an enquiry (with optional attachments) via email.
- **Profile & account** — register and sign in with email/password or Google, and choose a role on first sign-in.

### For administrators
- **Dashboard** — bookings, support requests, and contact messages in a single place, backed by real-time Firestore listeners.
- **CRUD** — create, read, update, and delete bookings, support requests, and messages.
- **Bulk email** — send an email to multiple recipients at once.
- **Notifications** — manage user notifications, with automatic cleanup of old ones.

### Accessibility
- An accessibility toolbar (font size, high contrast, etc.).
- A prominent **HELP / Emergency Support** button available across the app.
- Colour and contrast choices made with WCAG AA in mind.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| Build tool | [Vite](https://vitejs.dev/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| UI | [Bootstrap 5](https://getbootstrap.com/) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Maps | [Leaflet](https://leafletjs.com/) |
| Backend / data | [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting, Cloud Functions) |
| Email | [EmailJS](https://www.emailjs.com/) |
| PDF export | [jsPDF](https://github.com/parallax/jsPDF) + html2canvas |
| Sanitisation | [DOMPurify](https://github.com/cure53/DOMPurify) |

---

## Project structure

```
silverbridge-health/
├── src/
│   ├── assets/           # Global and accessibility CSS
│   ├── components/
│   │   ├── admin/        # Admin dashboard components (bulk email, data table)
│   │   └── common/       # Shared UI (navbar, footer, map, rating, accessibility)
│   ├── composables/      # useAccessibility
│   ├── data/             # Seed data (events, health resources)
│   ├── firebase/         # Firebase initialisation and config
│   ├── router/           # Routes and navigation guards
│   ├── services/         # EmailJS integration
│   ├── stores/           # Pinia store (auth)
│   ├── utils/            # Sanitisation helpers
│   └── views/            # Page components
├── functions/            # Firebase Cloud Functions
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json
├── firebase.json         # Hosting + Functions + Firestore config
└── vite.config.js
```

---

## Getting started

### Prerequisites

- **Node.js** `^22.18.0` or `>=24.12.0` (see `engines` in `package.json`; Cloud Functions run on Node 20)
- **npm**
- A Firebase project (`silverbridge-health`)

### Install

```bash
# from the project root
npm install

# Cloud Functions dependencies (only if you work on functions/)
cd functions
npm install
cd ..
```

### Environment variables

The app reads its Firebase and EmailJS configuration from environment variables via Vite. Create a `.env` file in the project root (a committed `.env` already exists in this repo — see [Security rules](#security-rules) for context):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

These values are the standard Firebase web-app config plus your EmailJS service/template IDs. You can find the Firebase values in **Firebase Console → Project settings → General → Your apps → Web app**.

### Run locally

```bash
npm run dev      # start the Vite dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

---

## Firebase setup

The project uses these Firebase products:

- **Authentication** — email/password and Google sign-in, with a `role` field (`senior`, `caregiver`, or `admin`) stored on the user's Firestore document.
- **Firestore** — collections: `users`, `bookings`, `ratings`, `supportRequests`, `contactMessages`, and `notifications`.
- **Hosting** — single-page app with a rewrite of all routes to `index.html`.
- **Cloud Functions** — see below.

`firebase.json` ties these together; `.firebaserc` points the CLI at the `silverbridge-health` project.

---

## Cloud Functions

Located in `functions/index.js` (Node 20):

| Function | Trigger | Purpose |
| --- | --- | --- |
| `sendBookingConfirmation` | Firestore `onWrite` on bookings | Emails the user a booking confirmation via nodemailer |
| `aggregateEventRatings` | `https.onCall` | Recomputes a booking/event's average rating |
| `cleanupOldNotifications` | `pubsub.schedule` | Deletes notifications older than a threshold |

```bash
cd functions
npm run serve     # run with the local emulator
npm run deploy    # firebase deploy --only functions
npm run logs      # view function logs
```

---

## Deployment

```bash
npm run build
firebase deploy --only hosting      # frontend only
firebase deploy                     # hosting + functions + Firestore rules/indexes
```

> **Note:** from mainland-China networks, `firebase` CLI and Google endpoints require a proxy (e.g. `HTTPS_PROXY=http://127.0.0.1:7897`); otherwise authentication fails with a misleading "credentials are no longer valid" error. This is a network issue, not a credential issue.

---

## Security rules

Access control lives in [`firestore.rules`](firestore.rules):

- **Seniors & caregivers** can read and write their own data.
- **Admins** can read all bookings, support requests, messages, and notifications.
- **Contact messages** can be created by anyone (they are an anonymous enquiry channel); everything else requires authentication.

The `.env` file committed in this repository contains only the Firebase web-app config and the EmailJS public key — both of which are designed to be shipped to the browser. Treat the Firebase Admin SDK service-account key as secret and **never** commit it.

---

## Author

Zi-Tao — FIT5032, Monash University (2026).
