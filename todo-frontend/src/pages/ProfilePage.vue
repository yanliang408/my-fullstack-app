<template>
  <q-page class="page-container">
    <div class="profile-wrapper">
      <div class="header-row">
        <div>
          <h1>My Profile</h1>
          <p>View and edit your personal and company information</p>
        </div>
        <q-btn label="Back to Todos" color="primary" @click="goToTodos" />
      </div>

      <q-banner v-if="error" class="bg-red text-white q-my-md" dense>
        {{ error }}
      </q-banner>

      <q-banner v-if="success" class="bg-green text-white q-my-md" dense>
        {{ success }}
      </q-banner>

      <q-spinner-dots v-if="loading" color="primary" class="q-mt-lg" />

      <q-card v-else flat bordered class="q-pa-md">
        <div class="section-title">Personal Information</div>
        <q-input v-model="form.email" label="Email" outlined dense readonly class="q-mb-sm" />
        <q-input v-model="form.fullName" label="Full Name" outlined dense class="q-mb-sm" />
        <q-input v-model="form.avatarUrl" label="Avatar URL" outlined dense class="q-mb-sm" />
        <q-input v-model="form.address" label="Address" outlined dense class="q-mb-sm" />
        <q-input v-model="form.phone" label="Phone" outlined dense class="q-mb-md" />

        <div class="section-title">Company Information</div>
        <q-input v-model="form.companyName" label="Company Name" outlined dense class="q-mb-sm" />
        <q-input v-model="form.companyAddress" label="Company Address" outlined dense class="q-mb-md" />

        <q-btn label="Save" color="primary" :loading="saving" @click="saveProfile" />
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const saving = ref(false)
    const error = ref(null)
    const success = ref(null)
    const form = ref({
      email: '',
      fullName: '',
      avatarUrl: '',
      address: '',
      phone: '',
      companyName: '',
      companyAddress: '',
    })

    const loadProfile = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await api.get('/profile/me')
        const data = response.data
        form.value.email = data.email || ''
        form.value.fullName = data.profile?.fullName || ''
        form.value.avatarUrl = data.profile?.avatarUrl || ''
        form.value.address = data.profile?.address || ''
        form.value.phone = data.profile?.phone || ''
        form.value.companyName = data.company?.name || ''
        form.value.companyAddress = data.company?.address || ''
      } catch (err) {
        error.value = 'Failed to load profile'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const saveProfile = async () => {
      saving.value = true
      success.value = null
      error.value = null
      try {
        await api.put('/profile/me', {
          fullName: form.value.fullName,
          avatarUrl: form.value.avatarUrl,
          address: form.value.address,
          phone: form.value.phone,
          companyName: form.value.companyName,
          companyAddress: form.value.companyAddress,
        })
        success.value = 'Profile updated successfully'
      } catch (err) {
        error.value = 'Failed to update profile'
        console.error(err)
      } finally {
        saving.value = false
      }
    }

    const goToTodos = () => {
      router.push('/')
    }

    onMounted(() => {
      loadProfile()
    })

    return {
      form,
      loading,
      saving,
      error,
      success,
      saveProfile,
      goToTodos,
    }
  },
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 24px;
  background-color: #f4f7fb;
}

.profile-wrapper {
  max-width: 760px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(25, 118, 210, 0.08);
  padding: 24px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #2f3e4e;
}

h1 {
  margin: 0;
  font-size: 28px;
}

p {
  margin: 6px 0 0;
  color: #606770;
}
</style>
