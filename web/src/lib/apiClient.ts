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

function buildHeaders(headers?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...headers,
  }
}

export async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
    method: "GET",
  })
  return handleResponse<T>(res)
}

export async function post<T, B = unknown>(path: string, body: B, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: "POST",
    headers: buildHeaders(init?.headers),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export { ApiError }
