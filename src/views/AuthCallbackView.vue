<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="status === 'loading'">
        <el-icon class="spin" :size="48" color="#409eff"><Loading /></el-icon>
        <p class="callback-text">{{ t('auth.oauthLoading') }}</p>
      </template>

      <template v-else-if="status === 'error'">
        <el-icon :size="48" color="#f56c6c"><CircleCloseFilled /></el-icon>
        <p class="callback-text error-text">{{ t('auth.oauthError') }}</p>
        <p class="callback-subtext">{{ errorMsg }}</p>
        <el-button type="primary" @click="router.push({ name: 'Login' })">
          {{ t('auth.backToLogin') }}
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

type Status = 'loading' | 'error'

const status = ref<Status>('loading')
const errorMsg = ref('')

onMounted(async () => {
  /**
   * Laravel backend redirects to frontend with:
   *   /auth/callback?token=3|ghi789rst...   → success
   *   /auth/callback?error=google_auth_failed → failure
   */
  const token = route.query.token as string | undefined
  const error = route.query.error as string | undefined

  // Backend reported an OAuth error
  if (error) {
    await router.push({ name: 'Login', query: { error } })
    return
  }

  if (!token) {
    status.value = 'error'
    errorMsg.value = t('auth.oauthNoToken')
    return
  }

  try {
    // Save token and fetch user data from GET /api/user
    await authStore.handleOAuthCallback(token)

    if (authStore.isAuthenticated) {
      ElMessage.success(t('auth.welcome', { name: authStore.userName }))
      await router.push({ name: 'Home' })
    } else {
      throw new Error(t('auth.oauthVerifyFail'))
    }
  } catch (err: unknown) {
    status.value = 'error'
    errorMsg.value = err instanceof Error ? err.message : t('common.error')
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--auth-gradient-start) 0%,
    var(--auth-gradient-end) 100%
  );
}

.callback-card {
  background: var(--app-card-bg);
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  min-width: 280px;
}

.callback-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--app-text);
  margin: 16px 0 4px;
}

.callback-subtext {
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 20px;
}

.error-text {
  color: #f56c6c;
}

/* Loading animation */
.spin {
  animation: rotation 1.2s linear infinite;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
