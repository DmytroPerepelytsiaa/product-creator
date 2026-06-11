/** Public representation of a product as returned by the Products API. */
export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in the major currency unit (e.g. dollars), e.g. 19.99. */
  price: number;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

/** Pagination metadata returned alongside a page of results. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Generic paginated response envelope. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export type PaginatedProducts = Paginated<Product>;
