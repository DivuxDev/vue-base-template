<template>
  <div class="audit-logs-view">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Document /></el-icon>
        {{ t('admin.audit.title') }}
      </h1>
      <el-button :loading="loading" :icon="Refresh" @click="refresh">
        {{ t('admin.audit.reload') }}
      </el-button>
    </div>

    <!-- Filters -->
    <el-card shadow="never" class="filters-card">
      <el-row :gutter="16">
        <!-- Search by user -->
        <el-col :xs="24" :sm="8">
          <el-input
            v-model="searchValue"
            :placeholder="t('admin.audit.searchPlaceholder')"
            clearable
            :prefix-icon="Search"
            @input="setSearch(searchValue)"
            @clear="setSearch('')"
          />
        </el-col>

        <!-- Action type -->
        <el-col :xs="24" :sm="6">
          <el-select
            v-model="actionFilter"
            :placeholder="t('admin.audit.allActions')"
            clearable
            style="width: 100%"
            @change="handleActionFilter"
          >
            <el-option
              v-for="action in knownActions"
              :key="action"
              :label="action"
              :value="action"
            />
          </el-select>
        </el-col>

        <!-- Date range -->
        <el-col :xs="24" :sm="10">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :start-placeholder="t('admin.audit.dateRange')"
            :end-placeholder="t('admin.audit.dateRange')"
            style="width: 100%"
            @change="handleDateRange"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- Audit logs table -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="logs"
        stripe
        style="width: 100%"
        row-key="id"
        :empty-text="t('admin.audit.noLogs')"
        @sort-change="({ prop, order }: { prop: string; order: string | null }) => setSort(prop || '', order === 'ascending' ? 'asc' : 'desc')"
      >
        <!-- Expand for diff -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <div v-if="row.old_values || row.new_values" class="diff-wrapper">
                <div v-if="row.old_values" class="diff-block diff-old">
                  <div class="diff-label">{{ t('admin.audit.oldValues') }}</div>
                  <pre class="diff-pre">{{ JSON.stringify(row.old_values, null, 2) }}</pre>
                </div>
                <div v-if="row.new_values" class="diff-block diff-new">
                  <div class="diff-label">{{ t('admin.audit.newValues') }}</div>
                  <pre class="diff-pre">{{ JSON.stringify(row.new_values, null, 2) }}</pre>
                </div>
              </div>
              <el-empty v-else :description="t('common.noData')" :image-size="40" />
            </div>
          </template>
        </el-table-column>

        <!-- Date -->
        <el-table-column :label="t('admin.audit.date')" width="170" sortable="custom" prop="created_at">
          <template #default="{ row }">
            <span class="date-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <!-- Performed by -->
        <el-table-column :label="t('admin.audit.performedBy')" min-width="180">
          <template #default="{ row }">
            <div v-if="row.user" class="user-cell">
              <el-avatar :size="28" class="user-avatar">
                {{ initials(row.user.name) }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ row.user.name }}</span>
                <span class="user-email">{{ row.user.email }}</span>
              </div>
            </div>
            <span v-else class="text-secondary">—</span>
          </template>
        </el-table-column>

        <!-- Action -->
        <el-table-column :label="t('admin.audit.action')" width="160">
          <template #default="{ row }">
            <el-tag :type="actionTagType(row.action)" effect="light" size="small">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Target -->
        <el-table-column :label="t('admin.audit.target')" min-width="160">
          <template #default="{ row }">
            <span v-if="row.auditable_type" class="date-text">
              {{ formatAuditableType(row.auditable_type) }}
              <span v-if="row.auditable_id"> #{{ row.auditable_id }}</span>
            </span>
            <span v-else class="text-secondary">—</span>
          </template>
        </el-table-column>

        <!-- IP Address -->
        <el-table-column :label="t('admin.audit.ipAddress')" width="130" align="center">
          <template #default="{ row }">
            <code class="ip-text">{{ row.ip_address || '—' }}</code>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh, Search, Document } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import * as auditApi from '@/api/auditLogs'
import type { AuditLog } from '@/types/audit'
import type { PaginationParams } from '@/types/pagination'
import { usePagination } from '@/composables/usePagination'

const { t } = useI18n()

const searchValue = ref('')
const actionFilter = ref('')
const dateRange = ref<[Date, Date] | null>(null)

const knownActions = [
  'user.login',
  'user.registered',
  'admin.user.role_changed',
  'admin.user.password_reset',
  'admin.user.deleted',
]

// ─── Pagination composable ────────────────────────────────────────────────────
const fetchLogs = (params: PaginationParams) =>
  auditApi.getAuditLogs(params as auditApi.AuditLogsParams)

const {
  data: logsData,
  meta,
  loading,
  goToPage,
  setSearch,
  refresh,
  params,
  setSort,
} = usePagination(fetchLogs, { per_page: 15 })

const logs = computed<AuditLog[]>(() => {
  if (!logsData.value) return []
  return (logsData.value as { audit_logs: AuditLog[] }).audit_logs ?? []
})

function handlePageSizeChange(size: number) {
  params.per_page = size
  params.page = 1
}

function handleActionFilter(action: string) {
  params.action = action || undefined
  params.page = 1
}

function handleDateRange(range: [Date, Date] | null) {
  if (range) {
    params.from = range[0].toISOString().split('T')[0]
    params.to = range[1].toISOString().split('T')[0]
  } else {
    params.from = undefined
    params.to = undefined
  }
  params.page = 1
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAuditableType(type: string): string {
  // Convert "App\\Models\\User" → "User"
  return type.split('\\').pop() ?? type
}

function actionTagType(action: string): 'success' | 'danger' | 'warning' | 'info' | '' {
  if (action.includes('delete') || action.includes('deleted')) return 'danger'
  if (action.includes('create') || action.includes('register') || action.includes('login')) return 'success'
  if (action.includes('reset') || action.includes('password')) return 'warning'
  return 'info'
}
</script>

<style scoped>
.audit-logs-view {
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

.filters-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.table-card {
  border-radius: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background: linear-gradient(135deg, var(--auth-gradient-start) 0%, var(--auth-gradient-end) 100%);
  color: #fff;
  font-weight: 700;
  font-size: 11px;
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
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: var(--app-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-text {
  font-size: 0.85rem;
  color: var(--app-text-secondary);
}

.text-secondary {
  color: var(--app-text-secondary);
  font-size: 0.85rem;
}

.ip-text {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--app-text-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

.expand-content {
  padding: 16px 24px;
}

.diff-wrapper {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.diff-block {
  flex: 1;
  min-width: 240px;
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
}

.diff-old {
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.diff-new {
  background: rgba(103, 194, 58, 0.08);
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.diff-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  color: var(--app-text-secondary);
}

.diff-pre {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--app-text);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
