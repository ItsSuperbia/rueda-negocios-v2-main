type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  headers?: HeadersInit;
}

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://gisistinfo.unicartagena.edu.co:3003";

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const baseHeaders: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...baseHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message ?? "Error inesperado en la API";
    throw new ApiClientError(message, response.status);
  }

  return payload as T;
}
