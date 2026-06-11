import type { Paginated, Product } from "@repo/contracts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the API. Is the Products service running?");
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // ignore non-JSON error bodies
  }
  return response.statusText || "Request failed";
}

export function fetchProducts(
  page: number,
  limit: number,
): Promise<Paginated<Product>> {
  return request<Paginated<Product>>(`/products?page=${page}&limit=${limit}`);
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}
