<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Quasar Todo Test</q-toolbar-title>
        <div v-if="displayName" class="welcome-wrap">
          <span class="welcome-text">Bienvenue</span>
          <button type="button" class="user-pill">
            <span class="user-name">{{ displayName }}</span>
            <q-avatar size="34px">
              <img v-if="avatarUrl" :src="avatarUrl" alt="User avatar" />
              <span v-else>{{ displayInitial }}</span>
            </q-avatar>
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 180px">
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>Personal information</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </button>
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
import { useRouter } from 'vue-router'
import api from '../services/api'

export default {
  name: 'MainLayout',
  setup() {
    const router = useRouter()
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
    const avatarUrl = computed(() => profile.value?.profile?.avatarUrl || '')
    const displayInitial = computed(() => (displayName.value || 'U').charAt(0).toUpperCase())

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

    const goToProfile = () => {
      router.push('/profile')
    }

    const logout = () => {
      localStorage.removeItem('authToken')
      router.push('/login')
    }

    return {
      displayName,
      avatarUrl,
      displayInitial,
      goToProfile,
      logout,
    }
  },
}
</script>

<style scoped>
.welcome-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  font-size: 18px;
  font-weight: 500;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  padding: 6px 10px 6px 14px;
  color: inherit;
  cursor: pointer;
}

.user-pill:hover {
  background: rgba(255, 255, 255, 0.08);
}

.user-name {
  font-size: 17px;
  font-weight: 500;
  line-height: 1;
}

@media (max-width: 700px) {
  .welcome-wrap {
    gap: 6px;
  }

  .welcome-text {
    font-size: 14px;
  }

  .user-pill {
    padding: 4px 8px 4px 10px;
    gap: 8px;
  }

  .user-name {
    font-size: 14px;
  }
}
</style>
