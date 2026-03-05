import httpClient from './httpClient'
import { ApiResponse } from '../types/apiType'

// ─────────────────────────────────────────────────────────────
//  Option types
// ─────────────────────────────────────────────────────────────

interface RequestOptions {
  params?   : Record<string, unknown>
  raw?      : boolean
  multipart?: boolean
}

export type FileFields = Record<string, File | Blob | null | undefined>


// ── Helpers ───────────────────────────────────────────────

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

export const buildFormData = (
  payload: Record<string, unknown>,
  fileFields: FileFields = {}
): FormData => {
  const form = new FormData()
  Object.entries(payload).forEach(([k, v]) => appendToForm(form, k, v))
  Object.entries(fileFields).forEach(([k, v]) => {
    if (v) form.append(k, v)
  })
  return form
}

// ─────────────────────────────────────────────────────────────
//  HTTP methods
// ─────────────────────────────────────────────────────────────

export const get = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const { params, raw = false } = options
  const res = await httpClient.get<ApiResponse<T>>
  (url, { params })
  return unwrap(res.data, raw) as T
}

export const post = async <T>(
  url: string,
  body: unknown = {},
  options: RequestOptions = {}
): Promise<T> => {
  const { params, raw = false, multipart = false} = options
  const res = await httpClient.post<ApiResponse<T>>
  (url, body, {
    params,
    headers: multipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
  return unwrap(res.data, raw) as T
}

export const put = async <T>(
  url: string,
  body: unknown = {},
  options: RequestOptions = {}
): Promise<T> => {
  const { params, raw = false, multipart = false} = options
  const res = await httpClient.put<ApiResponse<T>>
  (url, body, {
    params,
    headers: multipart ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })
  return unwrap(res.data, raw) as T
}

export const patch = async <T>(
  url: string,
  body: unknown = {},
  options: RequestOptions = {}
): Promise<T> => {
  const { params, raw = false} = options
  const res = await httpClient.patch<ApiResponse<T>>
  (url, body, { params})
  return unwrap(res.data, raw) as T
}

/** 'del' because 'delete' is a JS reserved word */
export const del = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const { params, raw = false} = options
  const res = await httpClient.delete<ApiResponse<T>>
  (url, { params})
  return unwrap(res.data, raw) as T
}
