"use client";

import type { Product } from "@repo/contracts";
import { useEffect, useState } from "react";

import { useProducts } from "@/hooks/use-products";
import { CreateProductDialog } from "./create-product-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import { Pagination } from "./pagination";
import { ProductTable } from "./product-table";

const PAGE_SIZE = 10;

export function ProductsView() {
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isPending, isError, error, isFetching, refetch } = useProducts(
    page,
    PAGE_SIZE,
  );

  // Keep the page in range when deletions shrink the total page count.
  useEffect(() => {
    if (data && data.meta.totalPages > 0 && page > data.meta.totalPages) {
      setPage(data.meta.totalPages);
    }
  }, [data, page]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Products
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create, browse and remove products in your catalog.
          </p>
        </div>
        <CreateProductDialog />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-sm">
        <ProductTable
          products={data?.data ?? []}
          isLoading={isPending}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
          isFetching={isFetching}
          onRetry={() => void refetch()}
          onDelete={setProductToDelete}
        />
        {data && data.data.length > 0 ? (
          <div className="border-t border-line px-4 py-3">
            <Pagination
              meta={data.meta}
              onPageChange={setPage}
              disabled={isFetching}
            />
          </div>
        ) : null}
      </div>

      <DeleteProductDialog
        product={productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      />
    </div>
  );
}
