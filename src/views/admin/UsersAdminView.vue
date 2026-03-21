<template>
  <div class="admin-users-view">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><UserFilled /></el-icon>
        {{ t('admin.users.title') }}
      </h1>
      <el-button :loading="loading" :icon="Refresh" @click="refresh">
        {{ t('admin.users.reload') }}
      </el-button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <el-input
        v-model="searchValue"
        :placeholder="t('admin.users.search')"
        size="large"
        clearable
        :prefix-icon="Search"
        @input="setSearch(searchValue)"
        @clear="setSearch('')"
      />
    </div>

    <!-- Stats -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-number">{{ meta.total }}</div>
          <div class="stat-label">{{ t('admin.users.totalUsers') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-number text-danger">{{ adminCount }}</div>
          <div class="stat-label">{{ t('admin.users.admins') }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-number text-primary">{{ userCount }}</div>
          <div class="stat-label">{{ t('admin.users.users') }}</div>
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
        @sort-change="handleSortChange"
      >
        <!-- ID -->
        <el-table-column prop="id" :label="t('admin.users.id')" width="70" align="center" sortable="custom" />

        <!-- Avatar + Name -->
        <el-table-column :label="t('admin.users.user')" min-width="200" sortable="custom" prop="name">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="34" :src="row.avatar ?? undefined" class="user-avatar">
                {{ initials(row.name) }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ row.name }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- Role -->
        <el-table-column :label="t('admin.users.role')" width="120" align="center" sortable="custom" prop="role">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" effect="light">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Created at -->
        <el-table-column :label="t('admin.users.created')" width="140" sortable="custom" prop="created_at">
          <template #default="{ row }">
            <span class="date-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column :label="t('admin.users.actions')" width="260" align="center" fixed="right">
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
              <el-tooltip :content="t('admin.users.resetPassword')" placement="top">
                <el-button
                  size="small"
                  :icon="Key"
                  @click="handleResetPassword(row)"
                />
              </el-tooltip>

              <!-- Delete -->
              <el-tooltip
                :content="row.id === currentUserId ? t('admin.users.cannotDeleteSelf') : t('admin.users.deleteUser')"
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

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-if="meta.last_page > 1"
          :current-page="meta.current_page"
          :page-size="meta.per_page"
          :total="meta.total"
          :page-sizes="[10, 15, 25, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="goToPage"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <!-- Dialog: generated temporary password -->
    <el-dialog
      v-model="passwordDialog.visible"
      :title="t('admin.users.passwordReset')"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-alert
        :title="t('admin.users.tempPasswordAlert')"
        :description="t('admin.users.tempPasswordDesc')"
        type="warning"
        show-icon
        :closable="false"
        class="mb-4"
      />
      <div class="password-box">
        <code class="password-value">{{ passwordDialog.newPassword }}</code>
        <el-button size="small" :icon="CopyDocument" @click="copyPassword">
          {{ copied ? t('common.confirm') : t('admin.users.copy') }}
        </el-button>
      </div>
      <template #footer>
        <el-button type="primary" @click="passwordDialog.visible = false">
          {{ t('admin.users.understood') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh, Key, Delete, CopyDocument, Search } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import * as adminApi from '@/api/adminUsers'
import type { User } from '@/types/auth'
import type { PaginationParams } from '@/types/pagination'
import { usePagination } from '@/composables/usePagination'

const { t } = useI18n()
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)

const searchValue = ref('')
const copied = ref(false)

const passwordDialog = ref({
  visible: false,
  newPassword: '',
})

// ─── Pagination composable ──────────────────────────────────────────────────
const fetchUsers = (params: PaginationParams) => adminApi.getUsers(params)

const {
  data: usersData,
  meta,
  loading,
  goToPage,
  setSearch,
  setSort,
  refresh,
  params,
} = usePagination(fetchUsers, { per_page: 15 })

const users = computed<User[]>(() => {
  if (!usersData.value) return []
  return (usersData.value as { users: User[] }).users ?? []
})

const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const userCount = computed(() => users.value.filter(u => u.role === 'user').length)

function handlePageSizeChange(size: number) {
  params.per_page = size
  params.page = 1
}

function handleSortChange({ prop, order }: { prop: string; order: string | null }) {
  if (!prop || !order) {
    setSort('', 'asc')
  } else {
    setSort(prop, order === 'ascending' ? 'asc' : 'desc')
  }
}

// ─── Change role ────────────────────────────────────────────────────────────
async function handleRoleChange(user: User, newRole: 'admin' | 'user') {
  try {
    await ElMessageBox.confirm(
      t('admin.users.confirmRoleMsg', { name: user.name, role: newRole }),
      t('admin.users.confirmRoleChange'),
      {
        confirmButtonText: t('admin.users.yesChange'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
    const { data: envelope } = await adminApi.changeUserRole(user.id, newRole)
    if (envelope.success && envelope.data) {
      refresh()
      ElMessage.success(t('admin.users.roleUpdated'))
    }
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(extractMsg(err) ?? t('admin.users.roleError'))
    }
  }
}

// ─── Reset password ──────────────────────────────────────────────────────────
async function handleResetPassword(user: User) {
  try {
    await ElMessageBox.confirm(
      t('admin.users.resetPasswordMsg', { name: user.name }),
      t('admin.users.resetPasswordTitle'),
      {
        confirmButtonText: t('admin.users.yesReset'),
        cancelButtonText: t('common.cancel'),
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
      ElMessage.error(extractMsg(err) ?? t('admin.users.resetError'))
    }
  }
}

// ─── Delete user ─────────────────────────────────────────────────────────────
async function handleDelete(user: User) {
  try {
    await ElMessageBox.confirm(
      t('admin.users.deleteUserMsg', { name: user.name, email: user.email }),
      t('admin.users.deleteUserTitle'),
      {
        confirmButtonText: t('admin.users.yesDelete'),
        cancelButtonText: t('common.cancel'),
        type: 'error',
        dangerouslyUseHTMLString: true,
      }
    )
    const { data: envelope } = await adminApi.deleteUser(user.id)
    if (envelope.success) {
      refresh()
      ElMessage.success(t('admin.users.userDeleted'))
    }
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error(extractMsg(err) ?? t('admin.users.deleteError'))
    }
  }
}

// ─── Copy password to clipboard ──────────────────────────────────────────────
async function copyPassword() {
  await navigator.clipboard.writeText(passwordDialog.value.newPassword)
  copied.value = true
  ElMessage.success(t('admin.users.copied'))
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--app-text);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 400px;
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
  color: var(--app-text);
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
  color: var(--app-text-secondary);
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
  background: linear-gradient(135deg, var(--auth-gradient-start) 0%, var(--auth-gradient-end) 100%);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: var(--app-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-text {
  font-size: 0.85rem;
  color: var(--app-text-secondary);
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

.password-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--app-bg);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 12px 16px;
}

.password-value {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--app-text);
  flex: 1;
  word-break: break-all;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
