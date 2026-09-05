import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { DiscountPolicyRuleDto, CreateDiscountPolicyRuleRequest } from '@dealflow360/contracts';
import { useCreateDiscountPolicy, useUpdateDiscountPolicy } from './useDiscountPolicies.js';
import { Button } from '../../components/ui/index.js';

interface DiscountPolicyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: DiscountPolicyRuleDto | null;
}

export const DiscountPolicyFormModal: React.FC<DiscountPolicyFormModalProps> = ({
  isOpen,
  onClose,
  ruleToEdit,
}) => {
  const isEditing = !!ruleToEdit;
  const createMutation = useCreateDiscountPolicy();
  const updateMutation = useUpdateDiscountPolicy();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customerTier, setCustomerTier] = useState<string>('GLOBAL');
  const [category, setCategory] = useState<string>('GLOBAL');
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<number>(10);
  const [minMarginPercent, setMinMarginPercent] = useState<string>('25');
  const [requiredApprovalRole, setRequiredApprovalRole] = useState<'SALES_MANAGER' | 'FINANCE_OPERATIONS'>('SALES_MANAGER');
  const [priority, setPriority] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (ruleToEdit) {
      setName(ruleToEdit.name);
      setDescription(ruleToEdit.description || '');
      setCustomerTier(ruleToEdit.customerTier || 'GLOBAL');
      setCategory(ruleToEdit.category || 'GLOBAL');
      setMaxDiscountPercent(ruleToEdit.maxDiscountPercent);
      setMinMarginPercent(ruleToEdit.minMarginPercent !== null && ruleToEdit.minMarginPercent !== undefined ? String(ruleToEdit.minMarginPercent) : '');
      setRequiredApprovalRole(ruleToEdit.requiredApprovalRole as any || 'SALES_MANAGER');
      setPriority(ruleToEdit.priority);
      setIsActive(ruleToEdit.isActive);
    } else {
      setName('');
      setDescription('');
      setCustomerTier('GLOBAL');
      setCategory('GLOBAL');
      setMaxDiscountPercent(10);
      setMinMarginPercent('25');
      setRequiredApprovalRole('SALES_MANAGER');
      setPriority(10);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [ruleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Policy name is required.');
      return;
    }

    if (maxDiscountPercent < 0 || maxDiscountPercent > 100) {
      setErrorMsg('Max discount percent must be between 0 and 100.');
      return;
    }

    const parsedMinMargin = minMarginPercent.trim() !== '' ? Number(minMarginPercent) : null;
    if (parsedMinMargin !== null && (isNaN(parsedMinMargin) || parsedMinMargin < 0 || parsedMinMargin > 100)) {
      setErrorMsg('Minimum margin percent must be a valid number between 0 and 100.');
      return;
    }

    const payload: CreateDiscountPolicyRuleRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      customerTier: customerTier === 'GLOBAL' ? null : (customerTier as any),
      category: category === 'GLOBAL' ? null : category.trim(),
      maxDiscountPercent: Number(maxDiscountPercent),
      minMarginPercent: parsedMinMargin,
      requiredApprovalRole: requiredApprovalRole as any,
      priority: Number(priority),
      isActive,
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
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Policy Rule Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Hardware Discount Governance"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Business Rationale
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value)}
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                  min="0"
                  max="100"
                  value={maxDiscountPercent}
                  onChange={(e) => setMaxDiscountPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none pr-8"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Min Governed Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={minMarginPercent}
                  onChange={(e) => setMinMarginPercent(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Required Approval Role
              </label>
              <select
                value={requiredApprovalRole}
                onChange={(e) => setRequiredApprovalRole(e.target.value as any)}
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
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                placeholder="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
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
