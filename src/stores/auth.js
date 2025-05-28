import { defineStore } from 'pinia'
import { supabase } from '../supabase'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    loginAttempts: 0,
    lastAttemptTime: null,
    isLocked: false,
    lockoutEndTime: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    remainingLockoutTime: (state) => {
      if (!state.isLocked) return 0
      const now = Date.now()
      return Math.max(0, state.lockoutEndTime - now)
    },
  },

  actions: {
    async login(email, password) {
      // Check if account is locked
      if (this.isLocked) {
        const remainingTime = this.remainingLockoutTime
        if (remainingTime > 0) {
          this.error = `Account is locked. Please try again in ${Math.ceil(remainingTime / 60000)} minutes.`
          return
        } else {
          // Reset lock if lockout period has passed
          this.isLocked = false
          this.loginAttempts = 0
        }
      }

      this.loading = true
      this.error = null

      try {
        // Validate email format
        if (!this.validateEmail(email)) {
          throw new Error('Invalid email format')
        }

        // Validate password strength
        if (!this.validatePassword(password)) {
          throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character')
        }

        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: {
            // Add additional security options
            shouldCreateUser: false,
            emailRedirectTo: window.location.origin
          }
        })

        if (error) {
          this.handleLoginError(error)
        } else {
          // Reset login attempts on successful login
          this.loginAttempts = 0
          this.isLocked = false
          this.user = data.user
          
          // Set up session refresh
          this.setupSessionRefresh()
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.loginAttempts = 0
        this.isLocked = false
        this.lastAttemptTime = null
        this.lockoutEndTime = null
      } catch (error) {
        console.error('Logout error:', error)
      }
    },

    async restoreSession() {
      this.loading = true
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          this.user = session.user
          this.setupSessionRefresh()
        }
      } catch (error) {
        console.error('Session restoration error:', error)
        this.user = null
      } finally {
        this.loading = false
      }
    },

    // Helper methods
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    validatePassword(password) {
      // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      return passwordRegex.test(password)
    },

    handleLoginError(error) {
      this.loginAttempts++
      this.lastAttemptTime = Date.now()

      if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        this.isLocked = true
        this.lockoutEndTime = Date.now() + LOCKOUT_DURATION
        this.error = `Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`
      } else {
        this.error = 'Invalid email or password'
      }
    },

    setupSessionRefresh() {
      // Set up automatic session refresh
      const refreshInterval = 4 * 60 * 60 * 1000 // 4 hours
      setInterval(async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) throw error
          if (session) {
            this.user = session.user
          }
        } catch (error) {
          console.error('Session refresh error:', error)
        }
      }, refreshInterval)
    }
  },
}) 