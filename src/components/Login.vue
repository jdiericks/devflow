<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-center">Sign In</h2>
      <form @submit.prevent="onLogin" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-semibold mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            :class="{ 'border-red-500': emailError }"
            required 
            @input="validateEmailInput"
          />
          <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
        </div>
        
        <div>
          <label class="block text-gray-700 font-semibold mb-1">Password</label>
          <div class="relative">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              :class="{ 'border-red-500': passwordError }"
              required 
              @input="validatePasswordInput"
            />
            <button 
              type="button"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
          <p class="text-gray-500 text-sm mt-1">
            Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character
          </p>
        </div>

        <div v-if="auth.isLocked" class="bg-red-50 border border-red-200 rounded p-3">
          <p class="text-red-600 text-sm">
            Account is locked. Please try again in {{ Math.ceil(auth.remainingLockoutTime / 60000) }} minutes.
          </p>
        </div>

        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
          :disabled="auth.loading || auth.isLocked || !isFormValid"
        >
          <span v-if="auth.loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign In</span>
        </button>

        <div v-if="auth.error" class="bg-red-50 border border-red-200 rounded p-3">
          <p class="text-red-600 text-sm text-center">{{ auth.error }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

function validateEmailInput() {
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!auth.validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

function validatePasswordInput() {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (!auth.validatePassword(password.value)) {
    passwordError.value = 'Password does not meet requirements'
  } else {
    passwordError.value = ''
  }
}

async function onLogin() {
  validateEmailInput()
  validatePasswordInput()
  
  if (!isFormValid.value) return

  await auth.login(email.value, password.value)
  if (!auth.error) {
    router.push('/')
  }
}
</script> 