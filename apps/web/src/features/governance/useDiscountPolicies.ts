import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client.js';
import {
  DiscountPolicyRuleDto,
  CreateDiscountPolicyRuleRequest,
  UpdateDiscountPolicyRuleRequest,
  EvaluateCommercialScenarioRequest,
  CommercialEvaluationDto,
  ApiResponse,
} from '@dealflow360/contracts';

export interface PolicyFilters {
  customerTier?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
}

export function useDiscountPolicies(filters: PolicyFilters = {}) {
  return useQuery({
    queryKey: ['discount-policies', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.customerTier) params.append('customerTier', filters.customerTier);
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<ApiResponse<DiscountPolicyRuleDto[]>>(`/discount-policies?${params.toString()}`);
      return response.data.data || [];
    },
  });
}

export function useDiscountPolicy(id: string) {
  return useQuery({
    queryKey: ['discount-policies', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DiscountPolicyRuleDto>>(`/discount-policies/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateDiscountPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDiscountPolicyRuleRequest) => {
      const response = await api.post<ApiResponse<DiscountPolicyRuleDto>>('/discount-policies', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-policies'] });
    },
  });
}

export function useUpdateDiscountPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDiscountPolicyRuleRequest }) => {
      const response = await api.patch<ApiResponse<DiscountPolicyRuleDto>>(`/discount-policies/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-policies'] });
    },
  });
}

export function useToggleDiscountPolicyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.patch<ApiResponse<DiscountPolicyRuleDto>>(`/discount-policies/${id}/status`, { isActive });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-policies'] });
    },
  });
}

export function useDeleteDiscountPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/discount-policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-policies'] });
    },
  });
}

export function useEvaluateCommercialScenario() {
  return useMutation({
    mutationFn: async (payload: EvaluateCommercialScenarioRequest) => {
      const response = await api.post<ApiResponse<CommercialEvaluationDto>>('/commercial-evaluations/evaluate', payload);
      return response.data.data;
    },
  });
}
