<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-logo">⚡</div>
        <h1 class="auth-title">Crear cuenta</h1>
        <p class="auth-subtitle">Únete en segundos</p>
      </div>

      <!-- Formulario -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="auth-form"
      >
        <el-form-item label="Nombre completo" prop="name">
          <el-input
            v-model="form.name"
            placeholder="Juan Pérez"
            size="large"
            :prefix-icon="User"
            autocomplete="name"
          />
        </el-form-item>

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
            placeholder="Mínimo 8 caracteres"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>

        <el-form-item label="Confirmar contraseña" prop="password_confirmation">
          <el-input
            v-model="form.password_confirmation"
            type="password"
            placeholder="Repite tu contraseña"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

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
          @click="handleSubmit"
        >
          Crear cuenta
        </el-button>
      </el-form>

      <!-- Divider OAuth -->
      <el-divider>o regístrate con</el-divider>

      <!-- Google OAuth -->
      <el-button
        size="large"
        class="btn-full btn-google"
        :icon="ChromeFilled"
        @click="handleGoogleLogin"
      >
        Continuar con Google
      </el-button>

      <!-- Link a login -->
      <p class="auth-footer-text">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="auth-link">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Message, Lock, ChromeFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import { googleRedirectUrl } from '@/api/auth'

const authStore = useAuthStore()
const { register } = useAuth()

const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

// Validador personalizado para confirmar contraseña
const validatePasswordConfirm = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value === '') {
    callback(new Error('Por favor confirma tu contraseña'))
  } else if (value !== form.password) {
    callback(new Error('Las contraseñas no coinciden'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  name: [
    { required: true, message: 'El nombre es obligatorio', trigger: 'blur' },
    { min: 2, message: 'Mínimo 2 caracteres', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'El correo es obligatorio', trigger: 'blur' },
    { type: 'email', message: 'Ingresa un correo válido', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'La contraseña es obligatoria', trigger: 'blur' },
    { min: 8, message: 'Mínimo 8 caracteres', trigger: 'blur' },
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.auth-card {
  background: #fff;
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
  color: #303133;
  margin: 0 0 4px;
}

.auth-subtitle {
  color: #909399;
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
  background: #fff;
  border: 1px solid #dadce0;
  color: #3c4043;
  font-weight: 500;
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
