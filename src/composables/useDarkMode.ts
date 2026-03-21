import { ref } from 'vue'

const stored = localStorage.getItem('color-scheme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialDark = stored ? stored === 'dark' : prefersDark

const isDark = ref(initialDark)

// Apply initial class
if (isDark.value) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

export function useDarkMode() {
  function toggleDark() {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('color-scheme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('color-scheme', 'light')
    }
  }

  return { isDark, toggleDark }
}
