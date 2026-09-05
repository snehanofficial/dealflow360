import React, { useState } from 'react';
import { usePriceLists, useCreatePriceList, useProducts, useUpsertPriceListEntry, useDeletePriceListEntry } from './useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { PriceListDto } from '@dealflow360/contracts';
import { DollarSign, Plus, X, AlertCircle, Check, Trash2, Globe, Shield } from 'lucide-react';

interface PriceListManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceListManagementModal: React.FC<PriceListManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: priceLists, isLoading: isPriceListsLoading } = usePriceLists();
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  const createPriceListMutation = useCreatePriceList();
  const upsertEntryMutation = useUpsertPriceListEntry();
  const deleteEntryMutation = useDeletePriceListEntry();

  const [selectedList, setSelectedList] = useState<PriceListDto | null>(null);

  // New Price List state
  const [name, setName] = useState('');
  const [customerTier, setCustomerTier] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [isDefault, setIsDefault] = useState(false);

  // New Entry state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [overridePrice, setOverridePrice] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreatePriceList = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Price list name is required.');
      return;
    }

    try {
      await createPriceListMutation.mutateAsync({
        name: name.trim(),
        customerTier: customerTier ? (customerTier as any) : null,
        currency,
        isDefault,
        isActive: true,
      });
      setName('');
      setSuccess('Price List created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create price list.');
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedList || !selectedProductId || overridePrice <= 0) {
      setError('Select a product and enter a valid positive override price.');
      return;
    }

    try {
      await upsertEntryMutation.mutateAsync({
        priceListId: selectedList.id,
        productId: selectedProductId,
        unitPrice: overridePrice,
      });
      setSelectedProductId('');
      setOverridePrice(0);
      setSuccess('Price list entry updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update price list entry.');
    }
  };

  const handleDeleteEntry = async (priceListId: string, productId: string) => {
    try {
      await deleteEntryMutation.mutateAsync({ priceListId, productId });
    } catch (err: any) {
      setError('Failed to delete price entry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-base font-bold text-slate-900">Price List & Tier Pricing Governance</h2>
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

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2 text-emerald-700 text-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Create Price List Section */}
        <form onSubmit={handleCreatePriceList} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Create Tier / Currency Price List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-1">
              <label className="block font-medium text-slate-600 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise USD"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Customer Tier</label>
              <select
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="">All Tiers (Standard)</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
                <option value="TIER_1">TIER_1</option>
                <option value="TIER_2">TIER_2</option>
                <option value="TIER_3">TIER_3</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                id="isDefaultList"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
              />
              <label htmlFor="isDefaultList" className="ml-1.5 font-medium text-slate-700 select-none">
                Default for Currency
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" variant="primary" isLoading={createPriceListMutation.isPending}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Price List
            </Button>
          </div>
        </form>

        {/* Existing Price Lists & Entry Manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Price Lists Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Price Lists ({priceLists?.length || 0})
            </h3>
            {isPriceListsLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading price lists...</div>
            ) : (
              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {priceLists?.map((list) => {
                  const isSelected = selectedList?.id === list.id;
                  return (
                    <div
                      key={list.id}
                      onClick={() => setSelectedList(list)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F3E9F1] border-l-4 border-[#714B67]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{list.name}</div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center">
                            <Shield className="w-3 h-3 mr-0.5 text-slate-400" />
                            {list.customerTier || 'GLOBAL'}
                          </span>
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-0.5 text-slate-400" />
                            {list.currency}
                          </span>
                          {list.isDefault && <span className="text-purple-700 font-bold">[DEFAULT]</span>}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {list.entries?.length || 0} entries
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Price Entries Manager */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {selectedList ? `Entries for "${selectedList.name}"` : 'Select a Price List'}
            </h3>

            {selectedList ? (
              <div className="space-y-3">
                <form onSubmit={handleAddEntry} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-2 py-1 border border-slate-200 rounded bg-white"
                  >
                    <option value="">-- Select Product --</option>
                    {productsData?.items?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={overridePrice || ''}
                    onChange={(e) => setOverridePrice(parseFloat(e.target.value) || 0)}
                    placeholder="Price"
                    className="w-20 px-2 py-1 border border-slate-200 rounded bg-white"
                  />
                  <Button type="submit" size="sm" variant="primary">
                    Save
                  </Button>
                </form>

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                  {selectedList.entries && selectedList.entries.length > 0 ? (
                    selectedList.entries.map((entry: any) => {
                      const prod = productsData?.items?.find((p) => p.id === entry.productId) || entry.product;
                      const prodName = prod?.name || 'Product Details Unavailable';
                      const prodSku = prod?.sku || '';
                      return (
                        <div key={entry.id} className="p-2 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{prodName}</span>
                            {prodSku && <span className="text-[10px] text-slate-400 ml-1 font-mono">{prodSku}</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">
                              {selectedList.currency} ${entry.unitPrice.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleDeleteEntry(selectedList.id, entry.productId)}
                              className="text-red-400 hover:text-red-600 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (

                    <div className="p-4 text-center text-[11px] text-slate-400">
                      No custom price entries for this list. Base list prices will apply.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                Click a Price List on the left to inspect and configure tier product prices.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
