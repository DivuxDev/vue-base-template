<template>
  <div class="profile-view">
    <el-row justify="center">
      <el-col :xs="24" :sm="20" :md="14" :lg="12">
        <!-- Loading skeleton -->
        <template v-if="authStore.loading && !user">
          <el-card>
            <el-skeleton :rows="5" animated />
          </el-card>
        </template>

        <template v-else-if="user">
          <!-- Avatar + name -->
          <div class="profile-hero">
            <el-avatar :size="90" :src="user.avatar ?? undefined" class="profile-avatar">
              {{ userInitials }}
            </el-avatar>
            <h1 class="profile-name">{{ user.name }}</h1>
            <el-tag type="success" effect="light" size="large">{{ t('profile.activeAccount') }}</el-tag>
          </div>

          <!-- Profile information -->
          <el-card class="profile-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><UserFilled /></el-icon>
                <span>{{ t('profile.accountInfo') }}</span>
              </div>
            </template>

            <el-descriptions :column="1" border>
              <el-descriptions-item :label="t('profile.id')">
                #{{ user.id }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('profile.name')">
                {{ user.name }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('profile.email')">
                {{ user.email }}
              </el-descriptions-item>
              <el-descriptions-item v-if="user.created_at" :label="t('profile.memberSince')">
                {{ formatDate(user.created_at) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- Actions -->
          <div class="profile-actions">
            <el-button
              type="primary"
              plain
              @click="openEditDialog"
            >
              <el-icon><Edit /></el-icon>
              {{ t('profile.editProfile') }}
            </el-button>
            <el-button
              type="danger"
              plain
              :loading="authStore.loading"
              @click="handleLogout"
            >
              <el-icon><SwitchButton /></el-icon>
              {{ t('profile.logout') }}
            </el-button>
          </div>
        </template>
      </el-col>
    </el-row>

    <!-- Edit Profile Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      :title="t('profile.editTitle')"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-position="top"
      >
        <el-form-item :label="t('profile.name')" prop="name">
          <el-input v-model="editForm.name" size="large" />
        </el-form-item>

        <el-form-item :label="t('profile.avatarUpload')">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="handleAvatarChange"
          >
            <el-avatar
              v-if="avatarPreview || user?.avatar"
              :size="80"
              :src="avatarPreview || user?.avatar || undefined"
              class="profile-avatar"
            />
            <el-button v-else>
              <el-icon><Upload /></el-icon>
              {{ t('profile.avatarUpload') }}
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeEditDialog">{{ t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          :loading="authStore.loading"
          @click="handleSaveProfile"
        >
          {{ authStore.loading ? t('profile.saving') : t('profile.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const avatarPreview = ref<string>('')
const avatarFile = ref<File | null>(null)

const editForm = reactive({
  name: '',
})

const editRules: FormRules = {
  name: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 2, message: t('validation.nameMin', { n: 2 }), trigger: 'blur' },
  ],
}

function openEditDialog() {
  editForm.name = user.value?.name ?? ''
  avatarPreview.value = ''
  avatarFile.value = null
  editDialogVisible.value = true
}

function closeEditDialog() {
  editDialogVisible.value = false
  avatarPreview.value = ''
  avatarFile.value = null
}

function handleAvatarChange(file: UploadFile) {
  if (file.raw) {
    avatarFile.value = file.raw
    avatarPreview.value = URL.createObjectURL(file.raw)
  }
}

async function handleSaveProfile() {
  const valid = await editFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const formData = new FormData()
  formData.append('name', editForm.name)
  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value)
  }

  const ok = await authStore.updateProfile(formData)
  if (ok) {
    closeEditDialog()
  }
}

/** Initials for avatar */
const userInitials = computed(() => {
  const name = user.value?.name ?? ''
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(t('nav.confirmLogoutMsg'), t('nav.confirmLogout'), {
      confirmButtonText: t('nav.yesLogout'),
      cancelButtonText: t('nav.cancel'),
      type: 'warning',
    })
    await authStore.logout()
    await router.push({ name: 'Login' })
  } catch {
    // User cancelled
  }
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
  background: linear-gradient(135deg, var(--auth-gradient-start) 0%, var(--auth-gradient-end) 100%);
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--app-text);
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
  color: var(--app-text);
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.avatar-uploader {
  display: flex;
  align-items: center;
}
</style>
