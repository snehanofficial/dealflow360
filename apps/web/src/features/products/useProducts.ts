import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client.js';
import {
  ProductDto,
  ProductFilterQuery,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CategoryDto,
  PriceListDto,
  CreatePriceListRequest,
} from '@dealflow360/contracts';

export function useProducts(params: ProductFilterQuery = { page: 1, limit: 10 }) {
  return useQuery<ProductListResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await api.get('/products', { params });
      return response.data.data;
    },
  });
}

export function useProduct(id?: string, tier?: string, currency?: string) {
  return useQuery<ProductDto>({
    queryKey: ['products', id, tier, currency],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const response = await api.get(`/products/${id}`, {
        params: { tier, currency },
      });
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/products/categories');
      return response.data.data;
    },
  });
}

export function usePriceLists() {
  return useQuery<PriceListDto[]>({
    queryKey: ['price-lists'],
    queryFn: async () => {
      const response = await api.get('/price-lists');
      return response.data.data;
    },
  });
}

export function usePriceList(id?: string) {
  return useQuery<PriceListDto>({
    queryKey: ['price-lists', id],
    queryFn: async () => {
      if (!id) throw new Error('Price List ID is required');
      const response = await api.get(`/price-lists/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await api.post('/products', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      const response = await api.patch(`/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePriceListRequest) => {
      const response = await api.post('/price-lists', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeletePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/price-lists/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; code: string }) => {
      const response = await api.post('/products/categories', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAttributes() {
  return useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const response = await api.get('/products/attributes');
      return response.data.data;
    },
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; values?: string[] }) => {
      const response = await api.post('/products/attributes', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
  });
}

export function useAddAttributeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attributeId, value }: { attributeId: string; value: string }) => {
      const response = await api.post(`/products/attributes/${attributeId}/values`, { value });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
  });
}

export function useDeleteAttributeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (valueId: string) => {
      const response = await api.delete(`/products/attributes/values/${valueId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      const response = await api.post(`/products/${productId}/variants`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variantId, data }: { productId: string; variantId: string; data: any }) => {
      const response = await api.patch(`/products/${productId}/variants/${variantId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      const response = await api.delete(`/products/${productId}/variants/${variantId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch(`/price-lists/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpsertPriceListEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceListId, productId, unitPrice }: { priceListId: string; productId: string; unitPrice: number }) => {
      const response = await api.post(`/price-lists/${priceListId}/entries`, { productId, unitPrice });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeletePriceListEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceListId, productId }: { priceListId: string; productId: string }) => {
      const response = await api.delete(`/price-lists/${priceListId}/entries/${productId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

