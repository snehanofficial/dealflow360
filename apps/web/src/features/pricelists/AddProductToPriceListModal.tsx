import React, { useState } from 'react';
import { useProducts, useUpsertPriceListEntry } from '../products/useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { PriceListDto, ProductDto } from '@dealflow360/contracts';
import { Plus, X, Search, AlertCircle, Check, DollarSign } from 'lucide-react';

interface AddProductToPriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceList: PriceListDto | null;
}

export const AddProductToPriceListModal: React.FC<AddProductToPriceListModalProps> = ({
  isOpen,
  onClose,
  priceList,
}) => {
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [overridePrice, setOverridePrice] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    search: search.trim() || undefined,
    page: 1,
    limit: 100,
  });

  const upsertEntryMutation = useUpsertPriceListEntry();

  if (!isOpen || !priceList) return null;

  // Filter out products already present in this Price List
  const existingProductIds = new Set(priceList.entries?.map((e) => e.productId) || []);
  const availableProducts = productsData?.items?.filter((p) => !existingProductIds.has(p.id)) || [];

  const selectedProduct = productsData?.items?.find((p) => p.id === selectedProductId);

  const handleSelectProduct = (prod: ProductDto) => {
    setSelectedProductId(prod.id);
    setOverridePrice(prod.unitPrice); // default to catalog list price for convenient editing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProductId) {
      setError('Please select a product from the list.');
      return;
    }

    if (overridePrice === '' || Number(overridePrice) <= 0) {
      setError('Please enter a valid positive price override.');
      return;
    }

    try {
      await upsertEntryMutation.mutateAsync({
        priceListId: priceList.id,
        productId: selectedProductId,
        unitPrice: Number(overridePrice),
      });
      setSelectedProductId('');
      setOverridePrice('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add product price to price list.');
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
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-[#714B67]" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Product to Price List</h2>
              <p className="text-xs text-slate-500">{priceList.name} ({priceList.currency})</p>
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
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by SKU or name..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Product Selection Table / List */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Select Catalog Product</label>
            {isProductsLoading ? (
              <div className="p-6 text-center text-slate-400">Loading catalog products...</div>
            ) : availableProducts.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-400">
                No unassigned catalog products found. All products are already added to this price list.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {availableProducts?.map((prod) => {
                  const isSelected = selectedProductId === prod.id;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F3E9F1] border-l-4 border-[#714B67]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{prod.name}</div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                          <span>SKU: {prod.sku}</span>
                          <span>•</span>
                          <span>Category: {prod.category.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Catalog Base:</span>
                        <span className="font-mono font-bold text-slate-700">${prod.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Product & Price Override Input */}
          {selectedProduct && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-slate-800 font-semibold">
                <span>Selected: {selectedProduct.name}</span>
                <span className="font-mono text-slate-500 text-[11px]">{selectedProduct.sku}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Base Catalog List Price</label>
                  <div className="font-mono font-bold text-slate-700 text-sm">
                    ${selectedProduct.unitPrice.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Price List Override Price ({priceList.currency}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">{sym}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={overridePrice}
                      onChange={(e) => setOverridePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="Enter price list unit price"
                      className="w-full pl-6 pr-3 py-1.5 font-mono font-bold border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!selectedProductId}
              isLoading={upsertEntryMutation.isPending}
            >
              Add Selected Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
