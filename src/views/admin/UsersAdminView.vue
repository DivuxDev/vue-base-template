<template>
  <div class="admin-users-view">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><UserFilled /></el-icon>
        Gestión de Usuarios
      </h1>
      <el-button :loading="loading" :icon="Refresh" @click="loadUsers">Recargar</el-button>
    </div>

    <!-- Stats -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-number">{{ users.length }}</div>
          <div class="stat-label">Total usuarios</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-number text-danger">{{ adminCount }}</div>
          <div class="stat-label">Admins</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-number text-primary">{{ userCount }}</div>
          <div class="stat-label">Users</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Users table -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="users"
        stripe
        style="width: 100%"
        row-key="id"
      >
        <!-- ID -->
        <el-table-column prop="id" label="ID" width="70" align="center" />

        <!-- Avatar + Name -->
        <el-table-column label="Usuario" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="34" :src="row.avatar ?? undefined" class="user-avatar">
                {{ initials(row.name) }}
              </el-avatar>
              <span class="user-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- Email -->
        <el-table-column prop="email" label="Email" min-width="220" />

        <!-- Role -->
        <el-table-column label="Rol" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" effect="light">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Created at -->
        <el-table-column label="Creado" width="140">
          <template #default="{ row }">
            <span class="date-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Acciones" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <div class="actions-cell">
              <!-- Change Role -->
              <el-select
                :model-value="row.role"
                size="small"
                style="width: 90px"
                :disabled="row.id === currentUserId"
                @change="(val: 'admin' | 'user') => handleRoleChange(row, val)"
              >
                <el-option value="user" label="user" />
                <el-option value="admin" label="admin" />
              </el-select>

              <!-- Reset Password -->
              <el-tooltip content="Resetear contraseña" placement="top">
                <el-button
                  size="small"
                  :icon="Key"
                  @click="handleResetPassword(row)"
                />
              </el-tooltip>

              <!-- Delete -->
              <el-tooltip
                :content="row.id === currentUserId ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'"
                placement="top"
              >
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  :disabled="row.id === currentUserId"
                  @click="handleDelete(row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog: nueva contraseña generada -->
    <el-dialog
      v-model="passwordDialog.visible"
      title="Contraseña reseteada"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="Contraseña temporal generada"
        description="Copia esta contraseña y compártela con el usuario de forma segura. No se volverá a mostrar."
        type="warning"
        show-icon
        :closable="false"
        class="mb-4"
      />
      <div class="password-box">
        <code class="password-value">{{ passwordDialog.newPassword }}</code>
        <el-button size="small" :icon="CopyDocument" @click="copyPassword">
          Copiar
        </el-button>
      </div>
      <template #footer>
        <el-button type="primary" @click="passwordDialog.visible = false">Entendido</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, Key, Delete, CopyDocument } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import * as adminApi from '@/api/adminUsers'
import type { User } from '@/types/auth'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)

const users = ref<User[]>([])
const loading = ref(false)

const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const userCount = computed(() => users.value.filter(u => u.role === 'user').length)

const passwordDialog = ref({
  visible: false,
  newPassword: '',
})

// ─── Load users ────────────────────────────────────────────────────────────────
async function loadUsers() {
  loading.value = true
  try {
    const { data: envelope } = await adminApi.getUsers()
    if (envelope.success && envelope.data) {
      users.value = envelope.data.users as User[]
    }
  } catch {
    ElMessage.error('No se pudieron cargar los usuarios.')
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)

// ─── Change role ───────────────────────────────────────────────────────────────
async function handleRoleChange(user: User, newRole: 'admin' | 'user') {
  try {
    await ElMessageBox.confirm(
      `¿Cambiar el rol de <strong>${user.name}</strong> a <strong>${newRole}</strong>?`,
      'Cambiar rol',
      {
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
    const { data: envelope } = await adminApi.changeUserRole(user.id, newRole)
    if (envelope.success && envelope.data) {
      // Actualizar en local sin recargar toda la lista
      const idx = users.value.findIndex(u => u.id === user.id)
      if (idx !== -1) users.value[idx] = envelope.data.user as User
      ElMessage.success('Rol actualizado correctamente.')
    }
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(extractMsg(err) ?? 'Error al cambiar el rol.')
    }
  }
}

// ─── Reset password ────────────────────────────────────────────────────────────
async function handleResetPassword(user: User) {
  try {
    await ElMessageBox.confirm(
      `¿Resetear la contraseña de <strong>${user.name}</strong>? Se generará una contraseña aleatoria y se revocarán todas sus sesiones.`,
      'Resetear contraseña',
      {
        confirmButtonText: 'Sí, resetear',
        cancelButtonText: 'Cancelar',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
    const { data: envelope } = await adminApi.resetPassword(user.id)
    if (envelope.success && envelope.data) {
      passwordDialog.value = {
        visible: true,
        newPassword: envelope.data.new_password,
      }
    }
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(extractMsg(err) ?? 'Error al resetear la contraseña.')
    }
  }
}

// ─── Delete user ───────────────────────────────────────────────────────────────
async function handleDelete(user: User) {
  try {
    await ElMessageBox.confirm(
      `¿Eliminar permanentemente a <strong>${user.name}</strong> (${user.email})? Esta acción no se puede deshacer.`,
      'Eliminar usuario',
      {
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        type: 'error',
        dangerouslyUseHTMLString: true,
      }
    )
    const { data: envelope } = await adminApi.deleteUser(user.id)
    if (envelope.success) {
      users.value = users.value.filter(u => u.id !== user.id)
      ElMessage.success('Usuario eliminado.')
    }
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(extractMsg(err) ?? 'Error al eliminar el usuario.')
    }
  }
}

// ─── Copy password to clipboard ───────────────────────────────────────────────
async function copyPassword() {
  await navigator.clipboard.writeText(passwordDialog.value.newPassword)
  ElMessage.success('Contraseña copiada al portapapeles.')
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function extractMsg(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const ax = err as { response?: { data?: { message?: string } } }
    return ax.response?.data?.message ?? null
  }
  return null
}
</script>

<style scoped>
.admin-users-view {
  padding-bottom: 48px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border-radius: 10px;
  margin-bottom: 12px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-number.text-danger {
  color: #f56c6c;
}

.stat-number.text-primary {
  color: #409eff;
}

.stat-label {
  font-size: 0.8rem;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-card {
  border-radius: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.date-text {
  font-size: 0.85rem;
  color: #606266;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.password-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
}

.password-value {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #303133;
  flex: 1;
  word-break: break-all;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
