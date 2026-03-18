<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'

const { notifications, clearNotification } = useNotifications()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="toast-item"
          role="alert"
          @click="clearNotification(notification.id)"
        >
          <!-- Avatar -->
          <div class="toast-avatar">
            <img
              v-if="notification.avatar"
              :src="notification.avatar"
              :alt="notification.name"
              class="toast-avatar-img"
            />
            <div v-else class="toast-avatar-initials">
              {{ getInitials(notification.name) }}
            </div>
          </div>

          <!-- Content -->
          <div class="toast-content">
            <p class="toast-name">{{ notification.name }}</p>
            <p class="toast-text">Acaba de iniciar sesión</p>
            <p class="toast-time">{{ formatTime(notification.timestamp) }}</p>
          </div>

          <!-- Close -->
          <button
            class="toast-close"
            aria-label="Cerrar notificación"
            @click.stop="clearNotification(notification.id)"
          >
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  width: 320px;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.toast-item:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.toast-avatar {
  flex-shrink: 0;
}

.toast-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.toast-avatar-initials {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-text {
  font-size: 12px;
  color: #606266;
  margin: 0 0 4px;
}

.toast-time {
  font-size: 11px;
  color: #909399;
  margin: 0;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #909399;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #303133;
}

/* Animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  transform: translateX(110%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(110%);
  opacity: 0;
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
