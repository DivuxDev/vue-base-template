import { ref, onUnmounted } from 'vue'
import echo from '@/lib/echo'

export interface LoginNotification {
  id: string
  userId: number
  name: string
  avatar: string | null
  timestamp: Date
}

export function useNotifications() {
  const notifications = ref<LoginNotification[]>([])

  const channel = echo?.channel('notifications')

  channel?.listen('.user.logged-in', (payload: { id: number; name: string; avatar: string | null }) => {
    const notification: LoginNotification = {
      id: crypto.randomUUID(),
      userId: payload.id,
      name: payload.name,
      avatar: payload.avatar,
      timestamp: new Date(),
    }

    notifications.value.unshift(notification)

    setTimeout(() => {
      clearNotification(notification.id)
    }, 5000)
  })

  function clearNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function clearAll() {
    notifications.value = []
  }

  onUnmounted(() => {
    echo?.leaveChannel('notifications')
  })

  return {
    notifications,
    clearNotification,
    clearAll,
  }
}
