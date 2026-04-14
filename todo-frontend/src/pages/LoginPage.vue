<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="mode-tabs">
        <button 
          :class="['tab', { active: isLogin }]"
          @click="isLogin = true"
        >
          Login
        </button>
        <button 
          :class="['tab', { active: !isLogin }]"
          @click="isLogin = false"
        >
          Sign Up
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="isLogin" class="form-container">
        <h1>Login</h1>
        <p>Enter your credentials to access your todos</p>
        
        <input
          v-model="loginForm.email"
          type="email"
          placeholder="Email"
          class="input-field"
        />
        
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="Password"
          class="input-field"
        />
        
        <button @click="handleLogin" :disabled="loading" class="submit-btn">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- Sign Up Form -->
      <div v-else class="form-container">
        <h1>Create Account</h1>
        <p>Register a new account</p>
        
        <input
          v-model="signupForm.email"
          type="email"
          placeholder="Email"
          class="input-field"
        />
        
        <input
          v-model="signupForm.password"
          type="password"
          placeholder="Password"
          class="input-field"
        />
        
        <input
          v-model="signupForm.confirmPassword"
          type="password"
          placeholder="Confirm Password"
          class="input-field"
        />
        
        <button @click="handleSignup" :disabled="loading" class="submit-btn">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const isLogin = ref(true)
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)
    
    const loginForm = ref({
      email: '',
      password: '',
    })
    
    const signupForm = ref({
      email: '',
      password: '',
      confirmPassword: '',
    })

    const handleLogin = async () => {
      if (!loginForm.value.email || !loginForm.value.password) {
        error.value = 'Please enter email and password'
        return
      }

      loading.value = true
      error.value = null

      try {
        const response = await api.post('/auth/login', {
          email: loginForm.value.email,
          password: loginForm.value.password,
        })

        localStorage.setItem('authToken', response.data.token)
        router.push('/')
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    const handleSignup = async () => {
      if (!signupForm.value.email || !signupForm.value.password || !signupForm.value.confirmPassword) {
        error.value = 'Please fill in all fields'
        return
      }

      if (signupForm.value.password !== signupForm.value.confirmPassword) {
        error.value = 'Passwords do not match'
        return
      }

      if (signupForm.value.password.length < 6) {
        error.value = 'Password must be at least 6 characters'
        return
      }

      loading.value = true
      error.value = null
      success.value = null

      try {
        const response = await api.post('/auth/signup', {
          email: signupForm.value.email,
          password: signupForm.value.password,
        })

        success.value = 'Account created successfully! You can now log in.'
        signupForm.value = { email: '', password: '', confirmPassword: '' }
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
          isLogin.value = true
          success.value = null
        }, 2000)
      } catch (err) {
        error.value = err.response?.data?.message || 'Sign up failed'
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      loading,
      error,
      success,
      loginForm,
      signupForm,
      handleLogin,
      handleSignup,
    }
  },
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  padding: 20px;
}

.auth-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
}

.mode-tabs {
  display: flex;
  gap: 0;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.tab {
  flex: 1;
  padding: 16px 0;
  text-align: center;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #6c757d;
  border-bottom: 4px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.tab:hover {
  color: #495057;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background-color: white;
}

.form-container {
  animation: fadeIn 0.3s ease-in;
  padding: 40px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  text-align: center;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

p {
  text-align: center;
  color: #6c757d;
  margin: 0 0 32px 0;
  font-size: 14px;
}

.input-field {
  width: 100%;
  padding: 12px 14px;
  margin: 12px 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 100%;
  padding: 12px 16px;
  margin-top: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  padding: 12px 16px;
  background-color: #fee2e2;
  border-radius: 6px;
  border-left: 4px solid #dc2626;
}

.success-message {
  color: #059669;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  padding: 12px 16px;
  background-color: #d1fae5;
  border-radius: 6px;
  border-left: 4px solid #059669;
}

/* Responsive design */
@media (max-width: 640px) {
  .auth-box {
    border-radius: 0;
  }

  .form-container {
    padding: 32px 24px;
  }

  h1 {
    font-size: 24px;
  }

  .input-field {
    padding: 14px 12px;
    font-size: 16px; /* Prevent iOS auto zoom */
  }
}
</style>