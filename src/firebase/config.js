import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export services for use throughout the app
export const auth = getAuth(app)

// Keep the user signed in across browser sessions (indefinitely, until they
// explicitly log out). The SDK auto-refreshes the ID token in the background,
// so there is no fixed session timeout. This is also the SDK default, but we
// set it explicitly so the intent is unambiguous.
setPersistence(auth, browserLocalPersistence).catch(console.error)

export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

export default app
