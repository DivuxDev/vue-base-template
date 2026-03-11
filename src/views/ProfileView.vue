<template>
  <div class="profile-view">
    <el-row justify="center">
      <el-col :xs="24" :sm="20" :md="14" :lg="12">
        <!-- Loading skeleton -->
        <template v-if="authStore.loading">
          <el-card>
            <el-skeleton :rows="5" animated />
          </el-card>
        </template>

        <template v-else-if="user">
          <!-- Avatar + nombre -->
          <div class="profile-hero">
            <el-avatar :size="90" class="profile-avatar">
              {{ userInitials }}
            </el-avatar>
            <h1 class="profile-name">{{ user.name }}</h1>
            <el-tag type="success" effect="light" size="large">Cuenta activa</el-tag>
          </div>

          <!-- Información del perfil -->
          <el-card class="profile-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><UserFilled /></el-icon>
                <span>Información de la cuenta</span>
              </div>
            </template>

            <el-descriptions :column="1" border>
              <el-descriptions-item label="ID">
                #{{ user.id }}
              </el-descriptions-item>
              <el-descriptions-item label="Nombre">
                {{ user.name }}
              </el-descriptions-item>
              <el-descriptions-item label="Correo electrónico">
                {{ user.email }}
              </el-descriptions-item>
              <el-descriptions-item label="Email verificado">
                <el-tag v-if="user.email_verified_at" type="success" size="small">
                  Verificado
                </el-tag>
                <el-tag v-else type="warning" size="small">Pendiente</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="user.created_at" label="Miembro desde">
                {{ formatDate(user.created_at) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- Acciones -->
          <div class="profile-actions">
            <el-button
              type="danger"
              plain
              :loading="authStore.loading"
              @click="handleLogout"
            >
              <el-icon><SwitchButton /></el-icon>
              Cerrar sesión
            </el-button>
          </div>
        </template>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

/** Iniciales para el avatar */
const userInitials = computed(() => {
  const name = user.value?.name ?? ''
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function handleLogout() {
  await ElMessageBox.confirm('¿Seguro que quieres cerrar sesión?', 'Confirmar', {
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    type: 'warning',
  })
  await authStore.logout()
  await router.push({ name: 'Login' })
}
</script>

<style scoped>
.profile-view {
  padding: 16px 0 48px;
}

.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  text-align: center;
}

.profile-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 800;
  color: #303133;
  margin: 0;
}

.profile-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
