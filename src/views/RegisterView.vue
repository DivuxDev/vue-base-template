<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-logo">⚡</div>
        <h1 class="auth-title">{{ t('auth.registerTitle') }}</h1>
        <p class="auth-subtitle">{{ t('auth.registerSubtitle') }}</p>
      </div>

      <!-- Form -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="auth-form"
      >
        <el-form-item :label="t('auth.fullName')" prop="name">
          <el-input
            v-model="form.name"
            :placeholder="t('auth.namePlaceholder')"
            size="large"
            :prefix-icon="User"
            autocomplete="name"
          />
        </el-form-item>

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
            :placeholder="t('validation.passwordPolicy')"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>

        <el-form-item :label="t('auth.confirmPassword')" prop="password_confirmation">
          <el-input
            v-model="form.password_confirmation"
            type="password"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

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
          @click="handleSubmit"
        >
          {{ t('auth.registerBtn') }}
        </el-button>
      </el-form>

      <!-- OAuth Divider -->
      <el-divider>{{ t('auth.orRegisterWith') }}</el-divider>

      <!-- Google OAuth -->
      <el-button
        size="large"
        class="btn-full btn-google"
        :icon="ChromeFilled"
        @click="handleGoogleLogin"
      >
        {{ t('auth.continueGoogle') }}
      </el-button>

      <!-- Login link -->
      <p class="auth-footer-text">
        {{ t('auth.hasAccount') }}
        <router-link to="/login" class="auth-link">{{ t('auth.loginHere') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Message, Lock, ChromeFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import { googleRedirectUrl } from '@/api/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const { register } = useAuth()

const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

// Custom validator for password confirmation
const validatePasswordConfirm = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value === '') {
    callback(new Error(t('validation.required')))
  } else if (value !== form.password) {
    callback(new Error(t('validation.passwordConfirm')))
  } else {
    callback()
  }
}

const rules: FormRules = {
  name: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 2, message: t('validation.nameMin', { n: 2 }), trigger: 'blur' },
  ],
  email: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { type: 'email', message: t('validation.emailInvalid'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 8, message: t('validation.passwordPolicy'), trigger: 'blur' },
  ],
  password_confirmation: [
    { required: true, validator: validatePasswordConfirm, trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await register({
    name: form.name,
    email: form.email,
    password: form.password,
    password_confirmation: form.password_confirmation,
  })
}

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
  max-width: 440px;
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
