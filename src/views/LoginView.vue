<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-logo">⚡</div>
        <h1 class="auth-title">{{ t('auth.loginTitle') }}</h1>
        <p class="auth-subtitle">{{ t('auth.loginSubtitle') }}</p>
      </div>

      <!-- OAuth Google error (redirected from /auth/callback?error=...) -->
      <el-alert
        v-if="oauthError"
        :title="t('auth.googleAuthError')"
        :description="oauthError"
        type="error"
        show-icon
        :closable="true"
        class="form-alert"
        @close="oauthError = ''"
      />

      <!-- Form -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item :label="t('auth.email')" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            size="large"
            :prefix-icon="Message"
            autocomplete="email"
          />
        </el-form-item>

        <el-form-item :label="t('auth.password')" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('auth.passwordPlaceholder')"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <div class="form-options">
          <span></span>
        </div>

        <!-- Global error -->
        <el-alert
          v-if="authStore.error"
          :title="authStore.error"
          type="error"
          show-icon
          :closable="false"
          class="form-alert"
        />

        <!-- Submit -->
        <el-button
          type="primary"
          size="large"
          class="btn-full"
          :loading="authStore.loading"
          native-type="submit"
          @click="handleSubmit"
        >
          {{ t('auth.loginBtn') }}
        </el-button>
      </el-form>

      <!-- OAuth Divider -->
      <el-divider>{{ t('auth.orContinueWith') }}</el-divider>

      <!-- Google OAuth -->
      <el-button
        size="large"
        class="btn-full btn-google"
        :icon="ChromeFilled"
        @click="handleGoogleLogin"
      >
        {{ t('auth.continueGoogle') }}
      </el-button>

      <!-- Register link -->
      <p class="auth-footer-text">
        {{ t('auth.noAccount') }}
        <router-link to="/register" class="auth-link">{{ t('auth.registerHere') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { Message, Lock, ChromeFilled } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import { googleRedirectUrl } from '@/api/auth'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const { login } = useAuth()

const formRef = ref<FormInstance>()
const oauthError = ref('')

// Read ?error=... sent by backend after a Google OAuth failure
onMounted(() => {
  const errorParam = route.query.error as string | undefined
  if (errorParam === 'google_auth_failed') {
    oauthError.value = t('auth.googleAuthErrorDesc')
  }
})

const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { type: 'email', message: t('validation.emailInvalid'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 6, message: t('validation.passwordMin', { n: 6 }), trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await login({ email: form.email, password: form.password })
}

/** Redirects to Laravel backend to start Google OAuth flow */
function handleGoogleLogin() {
  window.location.href = googleRedirectUrl()
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--auth-gradient-start) 0%,
    var(--auth-gradient-end) 100%
  );
  padding: 24px;
}

.auth-card {
  background: var(--app-card-bg);
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-logo {
  font-size: 42px;
  margin-bottom: 12px;
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--app-text);
  margin: 0 0 4px;
}

.auth-subtitle {
  color: var(--app-text-secondary);
  margin: 0;
  font-size: 0.95rem;
}

.auth-form {
  margin-bottom: 4px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-alert {
  margin-bottom: 16px;
}

.btn-full {
  width: 100%;
  margin-bottom: 4px;
}

.btn-google {
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  color: var(--app-text);
  font-weight: 500;
}

.btn-google:hover {
  opacity: 0.85;
}

.auth-footer-text {
  text-align: center;
  margin: 16px 0 0;
  color: var(--app-text-secondary);
  font-size: 0.9rem;
}

.auth-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 600;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
