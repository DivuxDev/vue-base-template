export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  sort_dir?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}

export interface PaginatedResponse<T> {
  success: boolean
  data: (T & { meta: PaginationMeta }) | null
  message: string
}
