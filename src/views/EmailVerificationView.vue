<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="status === 'loading'">
        <el-icon class="spin" :size="48" color="#409eff"><Loading /></el-icon>
        <p class="callback-text">{{ t('auth.verifyingEmail') }}</p>
      </template>

      <template v-else-if="status === 'success'">
        <el-icon :size="48" color="#67c23a"><CircleCheckFilled /></el-icon>
        <p class="callback-text success-text">{{ t('auth.emailVerified') }}</p>
        <p class="callback-subtext">{{ t('auth.redirecting') }}</p>
      </template>

      <template v-else-if="status === 'error'">
        <el-icon :size="48" color="#f56c6c"><CircleCloseFilled /></el-icon>
        <p class="callback-text error-text">{{ t('auth.oauthError') }}</p>
        <p class="callback-subtext">{{ t('auth.emailVerifyError') }}</p>
        <div class="callback-actions">
          <el-button
            type="primary"
            :loading="resending"
            @click="handleResend"
          >
            {{ t('profile.resendVerification') }}
          </el-button>
          <el-button @click="router.push({ name: 'Login' })">
            {{ t('auth.backToLogin') }}
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { verifyEmail, sendVerificationEmail } from '@/api/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

type Status = 'loading' | 'success' | 'error'

const status = ref<Status>('loading')
const resending = ref(false)

onMounted(async () => {
  const id = route.query.id as string | undefined
  const hash = route.query.hash as string | undefined
  const signature = route.query.signature as string | undefined

  if (!id || !hash || !signature) {
    status.value = 'error'
    return
  }

  try {
    await verifyEmail({ id: Number(id), hash, signature })
    status.value = 'success'
    setTimeout(() => {
      router.push({ name: 'Profile' })
    }, 3000)
  } catch {
    status.value = 'error'
  }
})

async function handleResend() {
  resending.value = true
  try {
    await sendVerificationEmail()
    ElMessage.success(t('profile.verificationSent'))
  } catch {
    ElMessage.error(t('profile.verificationSendError'))
  } finally {
    resending.value = false
  }
}
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
  background: var(--surface-container-lowest);
  border-radius: 1rem;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 50px var(--shadow-elevated);
  border: 1px solid var(--ghost-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  min-width: 280px;
}
html.dark .callback-card {
  background: rgba(25, 28, 30, 0.85);
}

.callback-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--on-surface);
  margin: 16px 0 4px;
}

.callback-subtext {
  color: var(--on-surface-variant);
  font-size: 0.875rem;
  margin: 0 0 20px;
}

.callback-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.success-text {
  color: #67c23a;
}

.error-text {
  color: var(--error);
}

.spin {
  animation: rotation 1.2s linear infinite;
}

@keyframes rotation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
