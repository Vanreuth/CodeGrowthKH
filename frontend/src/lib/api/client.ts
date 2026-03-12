/**
 * lib/api/client.ts
 *
 * HTTP client layer for all BFF → Spring Boot calls.
 *
 * Exports:
 *  - httpClient  : Axios instance with auto token-refresh interceptor
 *  - get / post / put / patch / del : typed request helpers
 *  - buildFormData : multipart helper
 *
 * Usage:
 *   import { get, post, put, del } from '@/lib/api/client'
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/apiType'

// ─────────────────────────────────────────────────────────────
//  Axios instance — auto refresh on 401
// ─────────────────────────────────────────────────────────────

interface QueueItem {
  resolve: (value: void) => void
  reject : (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

function processQueue(error: unknown): void {
  failedQueue.forEach((item) => (error ? item.reject(error) : item.resolve()))
  failedQueue = []
}

const AUTH_PATHS = ['/login', '/register', '/forgot-password']
function isOnAuthPage(): boolean {
  if (typeof window === 'undefined') return false
  return AUTH_PATHS.some((p) => window.location.pathname.startsWith(p))
}

// Do NOT intercept 401s that come from the refresh endpoint itself —
// that would cause an infinite loop (refresh → 401 → try refresh again…).
function isRefreshEndpoint(config: InternalAxiosRequestConfig): boolean {
  return !!config.url?.includes('/auth/refresh')
}

export const httpClient: AxiosInstance = axios.create({
  baseURL        : '',
  withCredentials: true,
  headers        : { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
)

httpClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status !== 401 ||
      original._retry ||
      isOnAuthPage() ||
      isRefreshEndpoint(original)
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) =>
        failedQueue.push({ resolve, reject })
      ).then(() => {
        original._retry = true
        return httpClient(original)
      })
    }

    original._retry = true
    isRefreshing    = true

    try {
      await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
      processQueue(null)
      return httpClient(original)
    } catch (refreshError) {
      processQueue(refreshError)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ─────────────────────────────────────────────────────────────
//  Request helpers
// ─────────────────────────────────────────────────────────────

interface RequestOptions {
  params?   : Record<string, unknown>
  raw?      : boolean
  multipart?: boolean
}

export type FileFields = Record<string, File | Blob | null | undefined>

function unwrap<T>(data: ApiResponse<T>, raw: boolean): T | ApiResponse<T> {
  return raw ? data : data.data
}

function appendToForm(form: FormData, key: string, value: unknown): void {
  if (value == null) return
  if (value instanceof File || value instanceof Blob) {
    form.append(key, value)
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => appendToForm(form, `${key}[${i}]`, item))
  } else if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
      appendToForm(form, `${key}.${k}`, v)
    )
  } else {
    form.append(key, String(value))
  }
}

export function buildFormData(
  payload   : Record<string, unknown>,
  fileFields: FileFields = {}
): FormData {
  const form = new FormData()
  Object.entries(payload).forEach(([k, v]) => appendToForm(form, k, v))
  Object.entries(fileFields).forEach(([k, v]) => { if (v) form.append(k, v) })
  return form
}

export async function get<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, raw = false } = options
  const res = await httpClient.get<ApiResponse<T>>(url, { params })
  return unwrap(res.data, raw) as T
}

export async function post<T>(url: string, body: unknown = {}, options: RequestOptions = {}): Promise<T> {
  const { params, raw = false, multipart = false } = options
  const res = await httpClient.post<ApiResponse<T>>(url, body, {
    params,
    headers: multipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
  return unwrap(res.data, raw) as T
}

export async function put<T>(url: string, body: unknown = {}, options: RequestOptions = {}): Promise<T> {
  const { params, raw = false, multipart = false } = options
  const res = await httpClient.put<ApiResponse<T>>(url, body, {
    params,
    headers: multipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
  return unwrap(res.data, raw) as T
}

export async function patch<T>(url: string, body: unknown = {}, options: RequestOptions = {}): Promise<T> {
  const { params, raw = false } = options
  const res = await httpClient.patch<ApiResponse<T>>(url, body, { params })
  return unwrap(res.data, raw) as T
}

/** `del` because `delete` is a reserved word in JavaScript. */
export async function del<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, raw = false } = options
  const res = await httpClient.delete<ApiResponse<T>>(url, { params })
  return unwrap(res.data, raw) as T
}
