import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/firebase/config'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const userRole = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)
  const isSenior = computed(() => userRole.value === 'senior')
  const isCaregiver = computed(() => userRole.value === 'caregiver')
  const isAdmin = computed(() => userRole.value === 'admin')
  const userId = computed(() => user.value?.uid || null)

  // Actions
  const ALLOWED_ROLES = ['senior', 'caregiver']

  async function register(email, password, role = 'senior') {
    // Enforce valid roles — prevent self-assignment of admin
    if (!ALLOWED_ROLES.includes(role)) {
      role = 'senior'
    }
    error.value = null
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Create user document in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
        displayName: '',
        phone: '',
      })
      user.value = cred.user
      userRole.value = role
      return cred
    } catch (err) {
      error.value = mapFirebaseError(err.code)
      throw err
    }
  }

  async function login(email, password) {
    error.value = null
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      user.value = cred.user
      // Fetch role from Firestore
      await fetchUserRole(cred.user.uid)
      return cred
    } catch (err) {
      error.value = mapFirebaseError(err.code)
      throw err
    }
  }

  async function loginWithGoogle() {
    error.value = null
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      user.value = cred.user
      // Check if user doc exists in Firestore
      const docRef = doc(db, 'users', cred.user.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        // First time Google login — create user doc with default role
        await setDoc(docRef, {
          email: cred.user.email,
          role: 'senior',
          createdAt: new Date().toISOString(),
          displayName: cred.user.displayName || '',
          phone: '',
        })
        userRole.value = 'senior'
      } else {
        userRole.value = docSnap.data().role
      }
      return cred
    } catch (err) {
      error.value = mapFirebaseError(err.code)
      throw err
    }
  }

  async function logout() {
    error.value = null
    try {
      await signOut(auth)
    } catch (err) {
      error.value = 'Failed to sign out. Please try again.'
    } finally {
      user.value = null
      userRole.value = null
    }
  }

  async function fetchUserRole(uid) {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid))
      if (docSnap.exists()) {
        userRole.value = docSnap.data().role || 'senior'
      } else {
        console.warn('User document missing in Firestore for uid:', uid)
        userRole.value = 'senior'
      }
    } catch (err) {
      console.error('Failed to fetch user role:', err)
      // Keep previous role if fetch fails; do not silently downgrade
    }
  }

  // Listen for auth state changes (persist login across refreshes)
  function initAuthListener() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          await fetchUserRole(firebaseUser.uid)
        } else {
          user.value = null
          userRole.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  function mapFirebaseError(code) {
    const map = {
      'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    }
    return map[code] || 'An unexpected error occurred. Please try again.'
  }

  return {
    user,
    userRole,
    loading,
    error,
    isAuthenticated,
    isSenior,
    isCaregiver,
    isAdmin,
    userId,
    register,
    login,
    loginWithGoogle,
    logout,
    initAuthListener,
  }
})
