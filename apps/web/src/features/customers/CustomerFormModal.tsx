import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateCustomerSchema,
  CreateCustomerRequest,
  CustomerDto,
  CustomerTier,
  CustomerStatus,
} from '@dealflow360/contracts';
import { Button } from '../../components/ui/Button.js';
import { X } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerRequest) => Promise<void>;
  initialData?: CustomerDto | null;
  isLoading?: boolean;
  apiError?: string | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  apiError = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCustomerRequest>({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      tier: (initialData?.tier as CustomerTier) || 'TIER_2',
      status: (initialData?.status as CustomerStatus) || 'ACTIVE',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || '',
        tier: initialData.tier as CustomerTier,
        status: initialData.status as CustomerStatus,
      });
    } else {
      reset({
        code: '',
        name: '',
        email: '',
        phone: '',
        tier: 'TIER_2',
        status: 'ACTIVE',
      });
    }
  }, [initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateCustomerRequest) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Customer Account' : 'Create New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md">
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={!!initialData}
              placeholder="e.g. CUST-ACME-001"
              {...register('code')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67] disabled:bg-slate-100 disabled:text-slate-500"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation"
              {...register('name')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="billing@acme.com"
              {...register('email')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Tier
              </label>
              <select
                {...register('tier')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
              >
                <option value="ENTERPRISE">Enterprise</option>
                <option value="TIER_1">Tier 1</option>
                <option value="TIER_2">Tier 2</option>
                <option value="TIER_3">Tier 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {initialData ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
