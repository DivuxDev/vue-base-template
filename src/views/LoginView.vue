<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-logo">⚡</div>
        <h1 class="auth-title">Iniciar sesión</h1>
        <p class="auth-subtitle">Bienvenido de nuevo</p>
      </div>

      <!-- Error OAuth Google (redirección desde /auth/callback?error=...) -->
      <el-alert
        v-if="oauthError"
        title="Error al iniciar sesión con Google"
        :description="oauthError"
        type="error"
        show-icon
        :closable="true"
        class="form-alert"
        @close="oauthError = ''"
      />

      <!-- Formulario -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Correo electrónico" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            size="large"
            :prefix-icon="Message"
            autocomplete="email"
          />
        </el-form-item>

        <el-form-item label="Contraseña" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Tu contraseña"
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

        <!-- Error global -->
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
          Iniciar sesión
        </el-button>
      </el-form>

      <!-- Divider OAuth -->
      <el-divider>o continúa con</el-divider>

      <!-- Google OAuth -->
      <el-button
        size="large"
        class="btn-full btn-google"
        :icon="ChromeFilled"
        @click="handleGoogleLogin"
      >
        Continuar con Google
      </el-button>

      <!-- Link a registro -->
      <p class="auth-footer-text">
        ¿No tienes cuenta?
        <router-link to="/register" class="auth-link">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Message, Lock, ChromeFilled } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import { googleRedirectUrl } from '@/api/auth'

const route = useRoute()
const authStore = useAuthStore()
const { login } = useAuth()

const formRef = ref<FormInstance>()
const oauthError = ref('')

// Leer ?error=... enviado por el backend tras un fallo en Google OAuth
onMounted(() => {
  const errorParam = route.query.error as string | undefined
  if (errorParam === 'google_auth_failed') {
    oauthError.value = 'La autenticación con Google falló. Intenta de nuevo o usa email y contraseña.'
  }
})

const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: 'El correo es obligatorio', trigger: 'blur' },
    { type: 'email', message: 'Ingresa un correo válido', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'La contraseña es obligatoria', trigger: 'blur' },
    { min: 6, message: 'Mínimo 6 caracteres', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await login({ email: form.email, password: form.password })
}

/** Redirige al backend Laravel para iniciar el flujo OAuth de Google */
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.auth-card {
  background: #fff;
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
  color: #303133;
  margin: 0 0 4px;
}

.auth-subtitle {
  color: #909399;
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
  background: #fff;
  border: 1px solid #dadce0;
  color: #3c4043;
  font-weight: 500;
}

.btn-google:hover {
  background: #f8f9fa;
  border-color: #dadce0;
}

.auth-footer-text {
  text-align: center;
  margin: 16px 0 0;
  color: #606266;
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
