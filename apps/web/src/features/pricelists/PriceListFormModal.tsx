import React, { useState, useEffect } from 'react';
import { useCreatePriceList, useUpdatePriceList } from '../products/useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { PriceListDto } from '@dealflow360/contracts';
import { Tag, X, AlertCircle, Check } from 'lucide-react';

interface PriceListFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceListToEdit?: PriceListDto | null;
}

export const PriceListFormModal: React.FC<PriceListFormModalProps> = ({
  isOpen,
  onClose,
  priceListToEdit,
}) => {
  const createMutation = useCreatePriceList();
  const updateMutation = useUpdatePriceList();

  const [name, setName] = useState('');
  const [customerTier, setCustomerTier] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (priceListToEdit) {
      setName(priceListToEdit.name);
      setCustomerTier(priceListToEdit.customerTier || '');
      setCurrency(priceListToEdit.currency || 'USD');
      setIsDefault(priceListToEdit.isDefault ?? false);
      setIsActive(priceListToEdit.isActive ?? true);
    } else {
      setName('');
      setCustomerTier('');
      setCurrency('USD');
      setIsDefault(false);
      setIsActive(true);
    }
    setError(null);
  }, [priceListToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Price list name is required.');
      return;
    }

    try {
      if (priceListToEdit) {
        await updateMutation.mutateAsync({
          id: priceListToEdit.id,
          data: {
            name: name.trim(),
            customerTier: customerTier ? (customerTier as any) : null,
            currency,
            isDefault,
            isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          customerTier: customerTier ? (customerTier as any) : null,
          currency,
          isDefault,
          isActive,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save price list.');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-base font-bold text-slate-900">
              {priceListToEdit ? 'Edit Price List' : 'Create New Price List'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Price List Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise India Pricing"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Tier</label>
              <select
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="">All Tiers (Global Default)</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
                <option value="TIER_1">TIER_1</option>
                <option value="TIER_2">TIER_2</option>
                <option value="TIER_3">TIER_3</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Applies override to specific tier customers.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency *</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Exact commercial currency.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefaultCheckbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
              />
              <label htmlFor="isDefaultCheckbox" className="font-semibold text-slate-700 select-none">
                Set as Default Price List for Currency ({currency})
              </label>
            </div>
            <p className="text-[10px] text-slate-400 pl-6">
              When enabled, this price list acts as the fallback for quotes in {currency} if no specific tier list matches. Only one list per currency can be default.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheckbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
            />
            <label htmlFor="isActiveCheckbox" className="font-semibold text-slate-700 select-none">
              Active Status
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
              {priceListToEdit ? 'Save Changes' : 'Create Price List'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
