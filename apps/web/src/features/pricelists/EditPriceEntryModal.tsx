import React, { useState, useEffect } from 'react';
import { useUpsertPriceListEntry } from '../products/useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { PriceListDto, ProductDto, PriceListEntryDto } from '@dealflow360/contracts';
import { Edit2, X, AlertCircle, Info } from 'lucide-react';

interface EditPriceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceList: PriceListDto | null;
  entry: PriceListEntryDto | null;
  product: ProductDto | null;
}

export const EditPriceEntryModal: React.FC<EditPriceEntryModalProps> = ({
  isOpen,
  onClose,
  priceList,
  entry,
  product,
}) => {
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const upsertEntryMutation = useUpsertPriceListEntry();

  useEffect(() => {
    if (entry) {
      setUnitPrice(entry.unitPrice);
    } else if (product) {
      setUnitPrice(product.unitPrice);
    } else {
      setUnitPrice('');
    }
    setError(null);
  }, [entry, product, isOpen]);

  if (!isOpen || !priceList || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (unitPrice === '' || Number(unitPrice) <= 0) {
      setError('Please enter a valid positive unit price.');
      return;
    }

    try {
      await upsertEntryMutation.mutateAsync({
        priceListId: priceList.id,
        productId: product.id,
        unitPrice: Number(unitPrice),
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save price list entry.');
    }
  };

  const currencySymbolMap: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const sym = currencySymbolMap[priceList.currency] || '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden my-8 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Edit2 className="w-5 h-5 text-[#714B67]" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Price List Entry</h2>
              <p className="text-xs text-slate-500">{priceList.name}</p>
            </div>
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
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Target Product
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{product.name}</div>
              <div className="font-mono text-[11px] text-[#714B67]">{product.sku}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Base Catalog Price:</span>
                <span className="font-bold text-slate-800">${product.unitPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Customer Tier / Currency:</span>
                <span className="font-bold text-[#714B67]">
                  {priceList.customerTier || 'GLOBAL'} ({priceList.currency})
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Price List Unit Price ({priceList.currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">{sym}</span>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Enter price list unit price"
                className="w-full pl-7 pr-3 py-2 font-mono font-bold text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-2 text-blue-700 text-[11px]">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              This is a contractual Price List override for this specific tier/currency. It does NOT modify the Product's base catalog price.
            </span>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={upsertEntryMutation.isPending}
            >
              Save Price
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
