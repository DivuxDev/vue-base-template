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
          <el-menu-item index="/">Inicio</el-menu-item>
          <el-menu-item v-if="isAuthenticated" index="/profile">Mi Perfil</el-menu-item>
        </el-menu>

        <!-- Acciones de usuario -->
        <div class="header-actions">
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
                    <el-icon><UserFilled /></el-icon> Mi Perfil
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" class="text-danger">
                    <el-icon><SwitchButton /></el-icon> Cerrar sesión
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>

          <template v-else>
            <router-link to="/login">
              <el-button>Iniciar sesión</el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary">Registrarse</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </el-header>

    <!-- ── Contenido principal ───────────────────────────────────────────── -->
    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- ── Footer ────────────────────────────────────────────────────────── -->
    <el-footer class="app-footer">
      <span>© {{ currentYear }} {{ appName }}. Construido con Vue 3 + Laravel.</span>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const appName = import.meta.env.VITE_APP_NAME as string
const currentYear = new Date().getFullYear()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const activeRoute = computed(() => route.path)

async function handleCommand(command: string) {
  if (command === 'logout') {
    await ElMessageBox.confirm('¿Seguro que quieres cerrar sesión?', 'Confirmar', {
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    })
    await authStore.logout()
    await router.push({ name: 'Login' })
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
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
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
  color: #303133;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none !important;
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

.app-main {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.app-footer {
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
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
