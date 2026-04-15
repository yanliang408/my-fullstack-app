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
        <div class="avatar-row q-mb-md">
          <q-avatar size="84px">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar" />
            <span v-else>{{ avatarFallback }}</span>
          </q-avatar>
          <div class="avatar-actions">
            <q-file
              v-model="selectedAvatarFile"
              outlined
              dense
              accept=".jpg,.jpeg,.png,.webp"
              label="Select avatar image"
            />
            <q-btn
              label="Upload Avatar"
              color="secondary"
              :loading="uploadingAvatar"
              :disable="!selectedAvatarFile"
              @click="uploadAvatar"
            />
          </div>
        </div>
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
import { getAccessToken } from '../utils/auth'
import { avatarBucket, getSupabaseClient } from '../services/supabase'

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const saving = ref(false)
    const uploadingAvatar = ref(false)
    const selectedAvatarFile = ref(null)
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

    const avatarFallback = ref('U')
    const currentUserId = ref('')

    const loadProfile = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await api.get('/profile/me')
        const data = response.data
        currentUserId.value = data.userId || ''
        form.value.email = data.email || ''
        form.value.fullName = data.profile?.fullName || ''
        form.value.avatarUrl = data.profile?.avatarUrl || ''
        form.value.address = data.profile?.address || ''
        form.value.phone = data.profile?.phone || ''
        form.value.companyName = data.company?.name || ''
        form.value.companyAddress = data.company?.address || ''
        avatarFallback.value = (form.value.fullName || form.value.email || 'U').charAt(0).toUpperCase()
      } catch (err) {
        error.value = 'Failed to load profile'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const uploadAvatar = async () => {
      if (!selectedAvatarFile.value) return
      const accessToken = getAccessToken()
      if (!accessToken) {
        error.value = 'You are not authenticated. Please login again.'
        return
      }

      const supabase = getSupabaseClient(accessToken)
      if (!supabase) {
        error.value = 'Supabase is not configured. Please set frontend env variables.'
        return
      }
      if (!currentUserId.value) {
        error.value = 'Current user is missing. Reload the profile page and retry.'
        return
      }

      uploadingAvatar.value = true
      error.value = null
      success.value = null
      try {
        const extension = selectedAvatarFile.value.name.split('.').pop()?.toLowerCase() || 'png'
        const filePath = `avatars/${currentUserId.value}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(avatarBucket)
          .upload(filePath, selectedAvatarFile.value, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage.from(avatarBucket).getPublicUrl(filePath)
        form.value.avatarUrl = data.publicUrl
        selectedAvatarFile.value = null
        success.value = 'Avatar uploaded. Click Save to persist profile.'
      } catch (err) {
        error.value = err.message || 'Failed to upload avatar'
      } finally {
        uploadingAvatar.value = false
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
      uploadingAvatar,
      selectedAvatarFile,
      avatarFallback,
      error,
      success,
      uploadAvatar,
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

.avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-actions {
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 28px;
}

p {
  margin: 6px 0 0;
  color: #606770;
}

@media (max-width: 720px) {
  .avatar-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
