<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-logo">⚡</div>
        <h1 class="auth-title">{{ t('auth.forgotPasswordTitle') }}</h1>
        <p class="auth-subtitle">{{ t('auth.forgotPasswordSubtitle') }}</p>
      </div>

      <!-- Success state -->
      <template v-if="submitted">
        <el-alert
          :title="t('auth.forgotPasswordSuccess')"
          type="success"
          show-icon
          :closable="false"
          class="form-alert"
        />
        <p class="auth-footer-text">
          <router-link to="/login" class="auth-link">{{ t('auth.backToLogin') }}</router-link>
        </p>
      </template>

      <!-- Form -->
      <template v-else>
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
              @keyup.enter="handleSubmit"
            />
          </el-form-item>

          <!-- Global error -->
          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
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
            :loading="loading"
            native-type="submit"
            @click="handleSubmit"
          >
            {{ t('auth.forgotPasswordBtn') }}
          </el-button>
        </el-form>

        <p class="auth-footer-text">
          <router-link to="/login" class="auth-link">{{ t('auth.backToLogin') }}</router-link>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { forgotPassword } from '@/api/passwordReset'

const { t } = useI18n()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { type: 'email', message: t('validation.emailInvalid'), trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    await forgotPassword(form.email)
    submitted.value = true
  } catch (err: unknown) {
    errorMessage.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    if (err instanceof Error) return err.message
    if ('response' in err) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } }
      }
      const status = axiosErr.response?.status
      const body = axiosErr.response?.data
      if (status === 429) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
      if (status === 422 && body?.errors) {
        const firstField = Object.values(body.errors)[0]
        if (firstField?.length) return firstField[0]
      }
      return body?.message ?? 'Error inesperado'
    }
  }
  return 'Error de conexión'
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
  background: var(--surface-container-lowest);
  border-radius: 1rem;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 50px var(--shadow-elevated);
  border: 1px solid var(--ghost-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
html.dark .auth-card {
  background: rgba(25, 28, 30, 0.85);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  font-size: 42px;
  margin-bottom: 12px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.auth-subtitle {
  color: var(--on-surface-variant);
  margin: 0;
  font-size: 0.875rem;
}

.auth-form {
  margin-bottom: 4px;
}

.form-alert {
  margin-bottom: 16px;
}

.btn-full {
  width: 100%;
  margin-bottom: 4px;
}

.auth-footer-text {
  text-align: center;
  margin: 16px 0 0;
  color: var(--on-surface-variant);
  font-size: 0.875rem;
}

.auth-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
