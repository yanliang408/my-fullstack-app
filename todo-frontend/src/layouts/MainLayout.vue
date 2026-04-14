<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Quasar Todo Test</q-toolbar-title>
        <div v-if="displayName" class="welcome-text">
          Bienvenue, {{ displayName }}
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'

export default {
  name: 'MainLayout',
  setup() {
    const profile = ref(null)

    const displayName = computed(() => {
      if (profile.value?.profile?.fullName) {
        return profile.value.profile.fullName
      }
      if (profile.value?.email) {
        return profile.value.email.split('@')[0]
      }
      return ''
    })

    const loadCurrentUserProfile = async () => {
      try {
        const response = await api.get('/profile/me')
        profile.value = response.data
      } catch (error) {
        profile.value = null
      }
    }

    onMounted(() => {
      loadCurrentUserProfile()
    })

    return {
      displayName,
    }
  },
}
</script>

<style scoped>
.welcome-text {
  font-size: 14px;
  font-weight: 500;
}
</style>
