import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DiscountPolicyRuleDto, CreateDiscountPolicyRuleRequest } from '@dealflow360/contracts';
import { useCreateDiscountPolicy, useUpdateDiscountPolicy } from './useDiscountPolicies.js';
import { Alert, Button } from '../../components/ui/index.js';

interface DiscountPolicyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: DiscountPolicyRuleDto | null;
}

const discountPolicyFormSchema = z.object({
  name: z.string().trim().min(1, 'Policy rule name is required'),
  description: z.string().optional(),
  customerTier: z.string(),
  category: z.string(),
  maxDiscountPercent: z.coerce
    .number({ invalid_type_error: 'Max discount percent must be a valid number' })
    .min(0, 'Max discount percent cannot be negative')
    .max(100, 'Max discount percent cannot exceed 100%'),
  minMarginPercent: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number({ invalid_type_error: 'Minimum margin percent must be a valid number' })
      .min(0, 'Minimum margin percent cannot be negative')
      .max(100, 'Minimum margin percent cannot exceed 100%')
      .nullable()
  ),
  requiredApprovalRole: z.enum(['SALES_MANAGER', 'FINANCE_OPERATIONS']),
  priority: z.coerce
    .number({ invalid_type_error: 'Priority must be a valid number' })
    .int('Priority must be an integer'),
  isActive: z.boolean(),
});

type DiscountPolicyFormValues = z.infer<typeof discountPolicyFormSchema>;

export const DiscountPolicyFormModal: React.FC<DiscountPolicyFormModalProps> = ({
  isOpen,
  onClose,
  ruleToEdit,
}) => {
  const isEditing = !!ruleToEdit;
  const createMutation = useCreateDiscountPolicy();
  const updateMutation = useUpdateDiscountPolicy();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiscountPolicyFormValues>({
    resolver: zodResolver(discountPolicyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      customerTier: 'GLOBAL',
      category: 'GLOBAL',
      maxDiscountPercent: 10,
      minMarginPercent: 25,
      requiredApprovalRole: 'SALES_MANAGER',
      priority: 10,
      isActive: true,
    },
  });

  useEffect(() => {
    if (ruleToEdit) {
      reset({
        name: ruleToEdit.name,
        description: ruleToEdit.description || '',
        customerTier: ruleToEdit.customerTier || 'GLOBAL',
        category: ruleToEdit.category || 'GLOBAL',
        maxDiscountPercent: ruleToEdit.maxDiscountPercent,
        minMarginPercent: ruleToEdit.minMarginPercent ?? null,
        requiredApprovalRole: (ruleToEdit.requiredApprovalRole as any) || 'SALES_MANAGER',
        priority: ruleToEdit.priority,
        isActive: ruleToEdit.isActive,
      });
    } else {
      reset({
        name: '',
        description: '',
        customerTier: 'GLOBAL',
        category: 'GLOBAL',
        maxDiscountPercent: 10,
        minMarginPercent: 25,
        requiredApprovalRole: 'SALES_MANAGER',
        priority: 10,
        isActive: true,
      });
    }
    setErrorMsg(null);
  }, [ruleToEdit, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: DiscountPolicyFormValues) => {
    setErrorMsg(null);

    const payload: CreateDiscountPolicyRuleRequest = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      customerTier: values.customerTier === 'GLOBAL' ? null : (values.customerTier as any),
      category: values.category === 'GLOBAL' ? null : values.category.trim(),
      maxDiscountPercent: values.maxDiscountPercent,
      minMarginPercent: values.minMarginPercent,
      requiredApprovalRole: values.requiredApprovalRole,
      priority: values.priority,
      isActive: values.isActive,
    };

    try {
      if (isEditing && ruleToEdit) {
        await updateMutation.mutateAsync({ id: ruleToEdit.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to save discount policy rule.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 max-w-xl w-full p-6 space-y-6 relative animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#F3E9F1] border border-[#E2CEE0] flex items-center justify-center text-[#714B67]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Discount Policy Rule' : 'Create Discount Policy Rule'}
              </h3>
              <p className="text-xs text-slate-500">
                Govern discount limits, minimum margins, and required approval roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Error Display on Top */}
        {errorMsg && (
          <Alert type="danger">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Policy Rule Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Enterprise Hardware Discount Governance"
              className={`w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-[#714B67] ${
                errors.name ? 'border-red-500 text-red-900 bg-red-50/20' : 'border-slate-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Business Rationale
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Explain the commercial governance intent..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Customer Tier
              </label>
              <select
                {...register('customerTier')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none bg-white"
              >
                <option value="GLOBAL">All Tiers (Global Rule)</option>
                <option value="ENTERPRISE">ENTERPRISE Tier</option>
                <option value="TIER_1">TIER_1 Key Accounts</option>
                <option value="TIER_2">TIER_2 Standard Accounts</option>
                <option value="TIER_3">TIER_3 Growth Accounts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Product Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none bg-white"
              >
                <option value="GLOBAL">All Categories (Global Rule)</option>
                <option value="Hardware">Hardware</option>
                <option value="Hardware Accessories">Hardware Accessories</option>
                <option value="Software Subscriptions">Software Subscriptions</option>
                <option value="Services">Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Max Governed Discount (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('maxDiscountPercent')}
                  className={`w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-[#714B67] pr-8 ${
                    errors.maxDiscountPercent ? 'border-red-500 text-red-900 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">%</span>
              </div>
              {errors.maxDiscountPercent && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.maxDiscountPercent.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Min Governed Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('minMarginPercent')}
                  placeholder="e.g. 25"
                  className={`w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-[#714B67] pr-8 ${
                    errors.minMarginPercent ? 'border-red-500 text-red-900 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">%</span>
              </div>
              {errors.minMarginPercent && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.minMarginPercent.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Required Approval Role
              </label>
              <select
                {...register('requiredApprovalRole')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none bg-white"
              >
                <option value="SALES_MANAGER">SALES_MANAGER</option>
                <option value="FINANCE_OPERATIONS">FINANCE_OPERATIONS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Evaluation Priority
              </label>
              <input
                type="number"
                {...register('priority')}
                placeholder="10"
                className={`w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-[#714B67] ${
                  errors.priority ? 'border-red-500 text-red-900 bg-red-50/20' : 'border-slate-300'
                }`}
              />
              {errors.priority && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveToggle"
              {...register('isActive')}
              className="w-4 h-4 text-[#714B67] rounded border-slate-300 focus:ring-[#714B67]"
            />
            <label htmlFor="isActiveToggle" className="text-sm text-slate-700 font-medium cursor-pointer">
              Policy Rule Active
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>{isEditing ? 'Save Changes' : 'Create Policy Rule'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

