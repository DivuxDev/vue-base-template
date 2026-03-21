<template>
  <el-container class="app-wrapper">
    <!-- ── Navbar ──────────────────────────────────────────────────────── -->
    <el-header class="app-header">
      <div class="header-inner">
        <!-- Logo / Brand -->
        <router-link to="/" class="brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">{{ appName }}</span>
        </router-link>

        <!-- Nav links (desktop) -->
        <el-menu
          mode="horizontal"
          :ellipsis="false"
          class="nav-menu"
          :default-active="activeRoute"
          router
        >
          <el-menu-item index="/">{{ t('nav.home') }}</el-menu-item>
          <el-menu-item v-if="isAuthenticated" index="/profile">{{ t('nav.profile') }}</el-menu-item>

          <!-- Admin submenu: only visible to administrators -->
          <el-sub-menu v-if="isAdmin" index="admin">
            <template #title>
              <el-icon><Setting /></el-icon>
              {{ t('nav.admin') }}
            </template>
            <el-menu-item index="/admin/users">
              <el-icon><UserFilled /></el-icon>
              {{ t('nav.userManagement') }}
            </el-menu-item>
            <el-menu-item index="/admin/audit-logs">
              <el-icon><Document /></el-icon>
              {{ t('nav.auditLogs') }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>

        <!-- Header actions -->
        <div class="header-actions">
          <!-- Dark mode toggle -->
          <el-tooltip :content="isDark ? t('common.lightMode') : t('common.darkMode')" placement="bottom">
            <el-button circle @click="toggleDark">
              <el-icon>
                <Sunny v-if="isDark" />
                <Moon v-else />
              </el-icon>
            </el-button>
          </el-tooltip>

          <!-- Language switcher -->
          <el-dropdown @command="setLocale" trigger="click">
            <el-button circle>
              <span class="lang-label">{{ currentLocale.toUpperCase() }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="loc in availableLocales"
                  :key="loc.value"
                  :command="loc.value"
                  :disabled="currentLocale === loc.value"
                >
                  {{ loc.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <template v-if="isAuthenticated">
            <el-dropdown @command="handleCommand" trigger="click">
              <el-button type="primary" circle>
                <el-icon><User /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>
                    <strong>{{ authStore.userName }}</strong>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="profile">
                    <el-icon><UserFilled /></el-icon> {{ t('nav.profile') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" class="text-danger">
                    <el-icon><SwitchButton /></el-icon> {{ t('nav.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>

          <template v-else>
            <router-link to="/login">
              <el-button>{{ t('nav.login') }}</el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary">{{ t('nav.register') }}</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </el-header>

    <!-- ── Main content ───────────────────────────────────────────────── -->
    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- ── Footer ────────────────────────────────────────────────────── -->
    <el-footer class="app-footer">
      <span>© {{ currentYear }} {{ appName }}. Construido con Vue 3 + Laravel.</span>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import { useLocale, availableLocales } from '@/composables/useLocale'
import { ElMessageBox } from 'element-plus'
import type { AppLocale } from '@/composables/useLocale'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleDark } = useDarkMode()
const { currentLocale, setLocale } = useLocale()

const appName = import.meta.env.VITE_APP_NAME as string
const currentYear = new Date().getFullYear()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const activeRoute = computed(() => route.path)

async function handleCommand(command: string) {
  if (command === 'logout') {
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
  } else if (command === 'profile') {
    await router.push({ name: 'Profile' })
  }
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-border);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 22px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--app-text);
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none !important;
  background: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-actions a {
  text-decoration: none;
}

.lang-label {
  font-size: 11px;
  font-weight: 700;
}

.app-main {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.app-footer {
  background: var(--app-footer-bg);
  border-top: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-secondary);
  font-size: 13px;
}

/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

:deep(.text-danger) {
  color: #f56c6c;
}
</style>
