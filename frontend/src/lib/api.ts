import { ApiError, ApiResponse, FetchOptions } from "./types";

function normalizeApiBase(value?: string): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const lower = trimmed.toLowerCase();
  if (lower === "undefined" || lower === "null" || lower === "none") {
    return "";
  }

  return trimmed.replace(/\/+$/, "");
}

export const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_BASE_URL,
 ) || "/api";
export { ApiError };

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

type ApiRequestOptions = Omit<RequestInit, "method" | "body" | "headers"> & {
  headers?: HeadersInit;
  method?: RequestMethod;
  revalidate?: number;
  body?: unknown;
};

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    !!value &&
    typeof value === "object" &&
    "success" in (value as Record<string, unknown>) &&
    "message" in (value as Record<string, unknown>) &&
    "data" in (value as Record<string, unknown>)
  );
}

function toApiResponse<T>(value: unknown): ApiResponse<T> {
  if (isApiResponse<T>(value)) {
    return value;
  }

  return {
    success: true,
    message: "OK",
    data: (value as T) ?? (null as unknown as T),
  };
}

function shouldUseJsonHeader(body: unknown): boolean {
  return (
    body === undefined ||
    body === null ||
    typeof body === "string" ||
    (typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof URLSearchParams))
  );
}

function requestBody(body: unknown): BodyInit | undefined {
  if (body == null) return undefined;
  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams
  ) {
    return body;
  }
  if (typeof body === "string") {
    return body;
  }
  if (typeof body === "number" || typeof body === "boolean") {
    return String(body);
  }
  if (typeof body === "object" && body instanceof ArrayBuffer) {
    return body;
  }
  return JSON.stringify(body);
}

function requestHeaders(headers: HeadersInit | undefined, body: unknown): Headers {
  const result = new Headers(headers);
  if (shouldUseJsonHeader(body) && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json");
  }
  if (!result.has("Accept")) {
    result.set("Accept", "application/json");
  }
  return result;
}

async function parseJson(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function requestErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim().length > 0) {
      return msg;
    }
  }
  return `Request failed (${status})`;
}

async function request<T>(
  path: string,
  method: RequestMethod,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method: _method, revalidate, body, headers: requestHeadersInput, ...rest } = options;

  const headers = requestHeaders(requestHeadersInput, body);
  const init: RequestInit = {
    ...rest,
    method,
    headers,
    body: requestBody(body),
    credentials: "include",
  };

  if (typeof revalidate === "number") {
    (init as RequestInit & { next?: { revalidate?: number } }).next = { revalidate };
  }

  const response = await fetch(`${API_BASE}${path}`, init);

  if (!response.ok) {
    const payload = await parseJson(response);
    throw new ApiError(response.status, requestErrorMessage(payload, response.status), path, payload);
  }

  if (response.status === 204) {
    return { success: true, message: "OK", data: null as unknown as T };
  }

  const payload = await parseJson(response);
  if (payload === null) {
    return { success: true, message: "OK", data: null as unknown as T };
  }

  return toApiResponse<T>(payload);
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", ...rest } = options;
  return request<T>(path, method, rest);
}

export async function apiGet<T>(
  path: string,
  options: Omit<ApiRequestOptions, "method" | "body"> & FetchOptions = {},
): Promise<ApiResponse<T>> {
  return request<T>(path, "GET", options);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, "method" | "body"> & FetchOptions = {},
): Promise<ApiResponse<T>> {
  return request<T>(path, "POST", {
    ...options,
    body,
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, "method" | "body"> & FetchOptions = {},
): Promise<ApiResponse<T>> {
  return request<T>(path, "PUT", {
    ...options,
    body,
  });
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, "method" | "body"> & FetchOptions = {},
): Promise<ApiResponse<T>> {
  return request<T>(path, "PATCH", {
    ...options,
    body,
  });
}

export async function apiDelete<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return request<T>(path, "DELETE", options);
}

export function buildUrl(path: string, params: Record<string, unknown>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) return;
        query.append(key, String(item));
      }
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function toFormData(payload: Record<string, unknown>): FormData {
  const form = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) {
          continue;
        }
        form.append(key, item instanceof File || item instanceof Blob ? item : String(item));
      }
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      return;
    }

    form.append(key, String(value));
  });

  return form;
}

export async function authFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T | null> {
  const isAuthRoute =
    url.includes("/api/v1/auth/login") || url.includes("/api/v1/auth/refresh");

  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>) ?? {},
  };
  if (
    options.body &&
    typeof options.body === "string" &&
    !(headers as Record<string, string>)["Content-Type"]
  ) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  let res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !isAuthRoute) {
    const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login?expired=true";
      }
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await res.json();
    } catch {}

    throw new Error((errorBody as { message?: string })?.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return null;
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    return res.json();
  }

  return null;
}
