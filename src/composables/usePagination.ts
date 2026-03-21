import { ref, reactive, watch } from 'vue'
import type { PaginationMeta, PaginationParams } from '@/types/pagination'

type FetchFn<T> = (params: PaginationParams) => Promise<{ data: { success: boolean; data: (T & { meta: PaginationMeta }) | null; message: string } }>

export function usePagination<T>(fetchFn: FetchFn<T>, defaultParams: PaginationParams = {}) {
  const data = ref<T | null>(null) as { value: T | null }
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const params = reactive<PaginationParams>({
    page: 1,
    per_page: 15,
    search: '',
    sort: '',
    sort_dir: 'asc',
    ...defaultParams,
  })

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const cleanParams: PaginationParams = {}
      for (const key in params) {
        const val = params[key]
        if (val !== undefined && val !== '') {
          cleanParams[key] = val
        }
      }
      const { data: envelope } = await fetchFn(cleanParams)
      if (envelope.success && envelope.data) {
        const { meta: responseMeta, ...rest } = envelope.data
        data.value = rest as unknown as T
        meta.value = responseMeta
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        error.value = (err as { message: string }).message
      } else {
        error.value = 'Unknown error'
      }
    } finally {
      loading.value = false
    }
  }

  function goToPage(page: number) {
    params.page = page
  }

  function setSearch(value: string) {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      params.search = value
      params.page = 1
    }, 300)
  }

  function setSort(column: string, direction: 'asc' | 'desc') {
    params.sort = column
    params.sort_dir = direction
    params.page = 1
  }

  function refresh() {
    fetch()
  }

  // Auto-fetch when params change
  watch(
    () => ({ ...params }),
    () => {
      fetch()
    },
    { immediate: true, deep: true }
  )

  return {
    data,
    meta,
    loading,
    error,
    params,
    goToPage,
    setSearch,
    setSort,
    refresh,
  }
}
