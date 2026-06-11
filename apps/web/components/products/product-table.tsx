"use client";

import type { Product } from "@repo/contracts";
import { PackageOpen, RotateCw, Trash2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDate, formatPrice } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isFetching: boolean;
  onRetry: () => void;
  onDelete: (product: Product) => void;
}

const COLUMNS = "sm:grid-cols-[1fr_140px_140px_44px]";

export function ProductTable({
  products,
  isLoading,
  isError,
  errorMessage,
  isFetching,
  onRetry,
  onDelete,
}: ProductTableProps) {
  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message={errorMessage} onRetry={onRetry} />;
  if (products.length === 0) return <EmptyState />;

  return (
    <div className={cn("transition-opacity", isFetching && "opacity-60")}>
      <div
        className={cn(
          "hidden gap-4 border-b border-line px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-ink-subtle sm:grid",
          COLUMNS,
        )}
      >
        <span>Name</span>
        <span className="text-right">Price</span>
        <span className="text-right">Created</span>
        <span className="sr-only">Actions</span>
      </div>

      <ul>
        {products.map((product) => (
          <li
            key={product.id}
            className={cn(
              "grid grid-cols-1 gap-1 border-b border-line px-4 py-3 last:border-b-0 sm:items-center sm:gap-4",
              COLUMNS,
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{product.name}</p>
              {product.description ? (
                <p className="truncate text-sm text-ink-muted">
                  {product.description}
                </p>
              ) : null}
            </div>
            <span className="tabular-nums text-ink sm:text-right">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-ink-muted sm:text-right">
              {formatDate(product.createdAt)}
            </span>
            <div className="sm:flex sm:justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${product.name}`}
                className="hover:text-danger"
                onClick={() => onDelete(product)}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TableSkeleton() {
  return (
    <ul className="animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center justify-between border-b border-line px-4 py-4 last:border-b-0"
        >
          <div className="flex flex-col gap-2">
            <span className="h-3.5 w-40 rounded bg-line-strong" />
            <span className="h-3 w-56 rounded bg-line" />
          </div>
          <span className="h-3.5 w-16 rounded bg-line-strong" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <PackageOpen className="size-8 text-ink-subtle" strokeWidth={1.5} />
      <p className="font-medium text-ink">No products yet</p>
      <p className="max-w-xs text-sm text-ink-muted">
        Create your first product with the “Create Product” button above.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <TriangleAlert className="size-8 text-danger" strokeWidth={1.5} />
      <div>
        <p className="font-medium text-ink">Couldn’t load products</p>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          {message ?? "An unexpected error occurred."}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RotateCw />
        Try again
      </Button>
    </div>
  );
}
