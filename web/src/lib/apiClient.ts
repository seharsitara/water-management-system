const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const maybeJson = await res.json()
      message = (maybeJson as any)?.message || message
    } catch {
      const text = await res.text()
      if (text) message = text
    }
    throw new ApiError(message, res.status)
  }
  return res.json() as Promise<T>
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

function buildHeaders(headers?: HeadersInit): HeadersInit {
  const token = getAuthToken()
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) || {}),
  }
  if (token) {
    base["Authorization"] = `Bearer ${token}`
  }
  return base as HeadersInit
}

export async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    credentials: "include",
    ...init,
    method: "GET",
    headers: buildHeaders(init?.headers),
  })
  return handleResponse<T>(res)
}

export async function post<T, B = unknown>(path: string, body: B, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    method: "POST",
    headers: buildHeaders(init?.headers),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export { ApiError }
