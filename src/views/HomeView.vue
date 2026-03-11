<template>
  <div class="home-view">
    <!-- Hero Section -->
    <el-row justify="center">
      <el-col :xs="24" :sm="20" :md="16" :lg="14">
        <div class="hero">
          <div class="hero-icon">⚡</div>
          <h1 class="hero-title">Vue 3 + Laravel Starter</h1>
          <p class="hero-subtitle">
            Proyecto base listo para conectarse con un backend Laravel con autenticación
            Sanctum/JWT y OAuth Google.
          </p>

          <div class="hero-actions">
            <template v-if="authStore.isAuthenticated">
              <el-button type="primary" size="large" @click="router.push({ name: 'Profile' })">
                <el-icon><UserFilled /></el-icon>
                Ver mi perfil
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="large" @click="router.push({ name: 'Login' })">
                Iniciar sesión
              </el-button>
              <el-button size="large" @click="router.push({ name: 'Register' })">
                Crear cuenta
              </el-button>
            </template>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Stack cards -->
    <el-row :gutter="20" class="stack-cards" justify="center">
      <el-col v-for="item in stackItems" :key="item.title" :xs="12" :sm="8" :md="6">
        <el-card class="stack-card" shadow="hover">
          <div class="stack-icon">{{ item.icon }}</div>
          <div class="stack-label">{{ item.title }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Features -->
    <el-row justify="center" class="features-section">
      <el-col :xs="24" :md="20">
        <h2 class="section-title">¿Qué incluye este starter?</h2>
        <el-row :gutter="20">
          <el-col v-for="f in features" :key="f.title" :xs="24" :sm="12" :md="8">
            <el-card class="feature-card" shadow="never">
              <el-icon class="feature-icon" :size="28">
                <component :is="f.icon" />
              </el-icon>
              <h3>{{ f.title }}</h3>
              <p>{{ f.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const stackItems = [
  { icon: '💚', title: 'Vue 3' },
  { icon: '⚡', title: 'Vite' },
  { icon: '🔷', title: 'TypeScript' },
  { icon: '🍍', title: 'Pinia' },
  { icon: '🛣️', title: 'Vue Router' },
  { icon: '🎨', title: 'Element Plus' },
  { icon: '🔗', title: 'Axios' },
  { icon: '🐘', title: 'Laravel API' },
]

const features = [
  {
    icon: 'Lock',
    title: 'Autenticación completa',
    description: 'Login, register, logout con tokens Bearer. Compatible con Sanctum y JWT.',
  },
  {
    icon: 'ChromeFilled',
    title: 'OAuth Google',
    description: 'Flujo de login con Google mediante redirección al backend Laravel.',
  },
  {
    icon: 'Cpu',
    title: 'Pinia Store',
    description: 'Estado global del usuario con persistencia en localStorage.',
  },
  {
    icon: 'MapLocation',
    title: 'Route Guards',
    description: 'Protección de rutas. Las páginas privadas redirigen al login automáticamente.',
  },
  {
    icon: 'Connection',
    title: 'Axios configurado',
    description: 'Interceptores para token Bearer y manejo automático de errores 401.',
  },
  {
    icon: 'MagicStick',
    title: 'UI lista',
    description: 'Layouts, navbar responsiva y formularios con validación usando Element Plus.',
  },
]
</script>

<style scoped>
.home-view {
  padding-bottom: 48px;
}

.hero {
  text-align: center;
  padding: 48px 0 32px;
}

.hero-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0 0 12px;
  color: #303133;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #606266;
  max-width: 540px;
  margin: 0 auto 28px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.stack-cards {
  margin: 32px 0;
}

.stack-card {
  text-align: center;
  margin-bottom: 12px;
}

.stack-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.stack-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.features-section {
  margin-top: 16px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}

.feature-card {
  height: 100%;
  margin-bottom: 16px;
  border-radius: 12px;
}

.feature-icon {
  color: #409eff;
  margin-bottom: 10px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 1rem;
  color: #303133;
}

.feature-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #606266;
  line-height: 1.5;
}
</style>
