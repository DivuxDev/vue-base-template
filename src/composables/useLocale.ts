import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export type AppLocale = 'es' | 'en'

export const availableLocales: { value: AppLocale; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

export function useLocale() {
  const { locale } = useI18n()

  const currentLocale = computed(() => locale.value as AppLocale)

  function setLocale(newLocale: AppLocale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }

  return {
    currentLocale,
    setLocale,
    availableLocales,
  }
}
