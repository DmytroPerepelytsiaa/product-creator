"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  fetchProducts,
  type CreateProductInput,
} from "@/lib/api";

export const productKeys = {
  all: ["products"] as const,
  list: (page: number, limit: number) =>
    ["products", "list", { page, limit }] as const,
};

export function useProducts(page: number, limit: number) {
  return useQuery({
    queryKey: productKeys.list(page, limit),
    queryFn: () => fetchProducts(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
