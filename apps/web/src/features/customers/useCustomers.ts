import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client.js';
import {
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilterQuery,
  CustomerListResponse,
} from '@dealflow360/contracts';

export function useCustomers(params: CustomerFilterQuery) {
  return useQuery<CustomerListResponse>({
    queryKey: ['customers', params],
    queryFn: async () => {
      const response = await api.get('/customers', { params });
      return response.data.data;
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery<CustomerDto>({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID required');
      const response = await api.get(`/customers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCustomerRequest) => {
      const response = await api.post('/customers', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerRequest }) => {
      const response = await api.patch(`/customers/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
}
