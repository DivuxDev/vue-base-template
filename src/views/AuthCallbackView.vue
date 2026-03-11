<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="status === 'loading'">
        <el-icon class="spin" :size="48" color="#409eff"><Loading /></el-icon>
        <p class="callback-text">Autenticando con Google…</p>
      </template>

      <template v-else-if="status === 'error'">
        <el-icon :size="48" color="#f56c6c"><CircleCloseFilled /></el-icon>
        <p class="callback-text error-text">Error al autenticar</p>
        <p class="callback-subtext">{{ errorMsg }}</p>
        <el-button type="primary" @click="router.push({ name: 'Login' })">
          Volver al login
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

type Status = 'loading' | 'error'

const status = ref<Status>('loading')
const errorMsg = ref('')

onMounted(async () => {
  /**
   * El backend Laravel redirige al frontend con:
   *   /auth/callback?token=3|ghi789rst...   → éxito
   *   /auth/callback?error=google_auth_failed → fallo
   */
  const token = route.query.token as string | undefined
  const error = route.query.error as string | undefined

  // El backend informó un error en el flujo OAuth
  if (error) {
    await router.push({ name: 'Login', query: { error } })
    return
  }

  if (!token) {
    status.value = 'error'
    errorMsg.value = 'No se recibió token del servidor.'
    return
  }

  try {
    // Guardar token y obtener datos del usuario desde GET /api/user
    await authStore.handleOAuthCallback(token)

    if (authStore.isAuthenticated) {
      ElMessage.success(`Bienvenido, ${authStore.userName}`)
      await router.push({ name: 'Home' })
    } else {
      throw new Error('No se pudo verificar el usuario.')
    }
  } catch (err: unknown) {
    status.value = 'error'
    errorMsg.value = err instanceof Error ? err.message : 'Error inesperado'
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  min-width: 280px;
}

.callback-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 4px;
}

.callback-subtext {
  color: #909399;
  font-size: 0.9rem;
  margin: 0 0 20px;
}

.error-text {
  color: #f56c6c;
}

/* Animación de carga */
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
