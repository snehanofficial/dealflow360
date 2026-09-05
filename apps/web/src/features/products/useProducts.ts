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
      const response = await api.get('/products/price-lists');
      return response.data.data;
    },
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
      const response = await api.post('/products/price-lists', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
