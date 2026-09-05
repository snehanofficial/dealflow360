import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ProductDto,
  ProductVariantDto,
  ProductAttributeDto,
  ProductCategoryEnum,
  ProductTypeEnum,
} from '@dealflow360/contracts';

import {
  useUpdateProduct,
  useCategories,
  useAttributes,
  useCreateAttribute,
  useAddAttributeValue,
  useDeleteAttributeValue,
  useDeleteVariant,
  usePriceLists,
  useUpsertPriceListEntry,
  useProduct,
} from './useProducts.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { VariantBuilderModal } from './VariantBuilderModal.js';
import {
  ShieldAlert,
  X,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Percent,
  Sliders,
  DollarSign,
  Calculator,
  Check,
  Globe,
  Shield,
  Save,
  AlertCircle,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: ProductDto | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'general' | 'pricing' | 'categories' | 'variants' | 'price-lists' | 'inspector';
  isManagerOrAdmin?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailPageProps> = ({
  product,
  isOpen,
  onClose,
  initialTab = 'general',
  isManagerOrAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'categories' | 'variants' | 'price-lists' | 'inspector'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Direct Inline Form States
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<'ONE_TIME' | 'RECURRING'>('ONE_TIME');
  const [editUnit, setEditUnit] = useState('Unit');
  const [editTaxRate, setEditTaxRate] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState(true);

  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editMaxDiscount, setEditMaxDiscount] = useState<number>(15);

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Multi-Category state
  const { data: allCategories } = useCategories();
  const updateProductMutation = useUpdateProduct();

  // Attribute state
  const { data: attributes } = useAttributes();
  const createAttributeMutation = useCreateAttribute();
  const addAttributeValueMutation = useAddAttributeValue();
  const deleteAttributeValueMutation = useDeleteAttributeValue();
  const deleteVariantMutation = useDeleteVariant();

  const [newAttributeName, setNewAttributeName] = useState('');
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});
  const [editingVariant, setEditingVariant] = useState<ProductVariantDto | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  // Price Lists state
  const { data: priceLists } = usePriceLists();
  const upsertPriceEntryMutation = useUpsertPriceListEntry();
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  // Effective Price Inspector State
  const [inspectorTier, setInspectorTier] = useState<string>('ENTERPRISE');
  const [inspectorCurrency, setInspectorCurrency] = useState<string>('USD');
  const [inspectorVariantId, setInspectorVariantId] = useState<string>('');

  const { data: effectiveProductData } = useProduct(
    product?.id,
    inspectorTier || undefined,
    inspectorCurrency || undefined,
  );

  const currentProduct = effectiveProductData || product;

  useEffect(() => {
    if (currentProduct) {
      setEditName(currentProduct.name);
      setEditDescription(currentProduct.description || '');
      setEditType(currentProduct.type as 'ONE_TIME' | 'RECURRING');
      setEditUnit(currentProduct.unit || 'Unit');
      setEditTaxRate(currentProduct.taxRate ?? 0);
      setEditIsActive(currentProduct.isActive ?? true);

      setEditUnitPrice(currentProduct.unitPrice);
      setEditCostPrice(currentProduct.costPrice);
      setEditMaxDiscount(currentProduct.maxAllowedDiscount);
    }
  }, [currentProduct, isOpen]);

  if (!isOpen || !product || !currentProduct) return null;

  // Realtime Live Calculations
  const liveGrossProfit = editUnitPrice - editCostPrice;
  const liveMarginPercent = editUnitPrice > 0 ? ((liveGrossProfit / editUnitPrice) * 100).toFixed(1) : '0';

  // Save General Info Handler
  const handleSaveGeneralSpecs = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        data: {
          name: editName.trim(),
          description: editDescription.trim(),
          type: editType,
          unit: editUnit.trim(),
          taxRate: editTaxRate,
          isActive: editIsActive,
        },
      });
      setSaveSuccess('General specifications updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to update general specifications.');
    }
  };

  // Save Pricing Specs Handler
  const handleSavePricingSpecs = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        data: {
          unitPrice: editUnitPrice,
          costPrice: editCostPrice,
          maxAllowedDiscount: editMaxDiscount,
        },
      });
      setSaveSuccess('Pricing and governance rules updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to update pricing specifications.');
    }
  };

  // Categories Handler
  const handleToggleSecondaryCategory = async (categoryId: string) => {
    const existingIds = currentProduct.categories?.map((c) => c.id) || [];
    let updatedIds: string[];
    if (existingIds.includes(categoryId)) {
      updatedIds = existingIds.filter((id) => id !== categoryId);
    } else {
      updatedIds = [...existingIds, categoryId];
    }

    try {
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        data: {
          additionalCategoryIds: updatedIds,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Attribute Creation
  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttributeName.trim()) return;
    try {
      await createAttributeMutation.mutateAsync({ name: newAttributeName.trim() });
      setNewAttributeName('');
    } catch (err) {
      console.error(err);
    }
  };

  // Value Creation
  const handleAddValue = async (attributeId: string) => {
    const val = newValueInputs[attributeId];
    if (!val || !val.trim()) return;
    try {
      await addAttributeValueMutation.mutateAsync({ attributeId, value: val.trim() });
      setNewValueInputs((prev) => ({ ...prev, [attributeId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariantMutation.mutateAsync({ productId: currentProduct.id, variantId });
    } catch (err) {
      console.error(err);
    }
  };

  // Save Price List Entry
  const handleSavePriceListEntry = async (priceListId: string) => {
    const override = priceOverrides[priceListId];
    if (override === undefined || override <= 0) return;
    try {
      await upsertPriceEntryMutation.mutateAsync({
        priceListId,
        productId: currentProduct.id,
        unitPrice: override,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Inspector Resolved Variant
  const selectedVariant = currentProduct.variants?.find((v) => v.id === inspectorVariantId);
  const resolvedExtraPrice = selectedVariant?.extraPrice || 0;
  const finalEffectivePrice = (currentProduct.unitPrice || 0) + resolvedExtraPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 p-6 space-y-6">
        {/* Header Summary */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded">
                {currentProduct.sku}
              </span>
              <Badge variant={currentProduct.isActive ? 'success' : 'default'} size="sm">
                {currentProduct.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
              <Badge variant="purple" size="sm">
                {currentProduct.type.replace('_', ' ')}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{currentProduct.name}</h2>
            {currentProduct.description && (
              <p className="text-xs text-slate-500 mt-1">{currentProduct.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Save Feedback */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-emerald-700 text-xs font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 border-b-2 transition-colors shrink-0 ${activeTab === 'general'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            GENERAL INFO
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-2.5 border-b-2 transition-colors shrink-0 ${activeTab === 'pricing'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            PRICING & MARGINS
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 border-b-2 transition-colors shrink-0 ${activeTab === 'categories'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            CATEGORIES ({currentProduct.categories?.length || 1})
          </button>
          <button
            onClick={() => setActiveTab('variants')}
            className={`pb-2.5 border-b-2 transition-colors shrink-0 ${activeTab === 'variants'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            ATTRIBUTES & VARIANTS ({currentProduct.variants?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('price-lists')}
            className={`pb-2.5 border-b-2 transition-colors shrink-0 ${activeTab === 'price-lists'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            PRICE LISTS
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`pb-2.5 border-b-2 transition-colors shrink-0 flex items-center ${activeTab === 'inspector'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Calculator className="w-3.5 h-3.5 mr-1" />
            EFFECTIVE PRICE INSPECTOR
          </button>
        </div>

        {/* TAB 1: GENERAL INFO (FULL EDITABLE CONTROL) */}
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editName}
                  disabled={!isManagerOrAdmin}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU (Read Only)</label>
                <input
                  type="text"
                  value={currentProduct.sku}
                  disabled
                  className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={editDescription}
                disabled={!isManagerOrAdmin}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Type *</label>
                <select
                  value={editType}
                  disabled={!isManagerOrAdmin}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="RECURRING">Recurring</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit of Measure *</label>
                <input
                  type="text"
                  value={editUnit}
                  disabled={!isManagerOrAdmin}
                  onChange={(e) => setEditUnit(e.target.value)}
                  placeholder="e.g. Unit, License, Hour"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Tax Rate (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={editTaxRate}
                    disabled={!isManagerOrAdmin}
                    onChange={(e) => setEditTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-6 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="editIsActiveCheck"
                checked={editIsActive}
                disabled={!isManagerOrAdmin}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
              />
              <label htmlFor="editIsActiveCheck" className="font-medium text-slate-700 select-none">
                Active offering in catalog
              </label>
            </div>

            {isManagerOrAdmin && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  onClick={handleSaveGeneralSpecs}
                  variant="primary"
                  size="sm"
                  isLoading={updateProductMutation.isPending}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save General Specs
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRICING & MARGINS (FULL EDITABLE CONTROL) */}
        {activeTab === 'pricing' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Selling Price ($) *</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editUnitPrice}
                    disabled={!isManagerOrAdmin}
                    onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Cost ($) *</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editCostPrice}
                    disabled={!isManagerOrAdmin}
                    onChange={(e) => setEditCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Allowed Discount Cap (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={editMaxDiscount}
                    disabled={!isManagerOrAdmin}
                    onChange={(e) => setEditMaxDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-6 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>

            {/* Calculated Margin Live Display */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Gross Profit Amount
                </span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  ${liveGrossProfit.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-emerald-600 block font-semibold uppercase tracking-wider text-[10px]">
                  List Margin Percentage
                </span>
                <span className="text-base font-bold text-emerald-800 mt-0.5 block">
                  {liveMarginPercent}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Discounts exceeding the <strong>{editMaxDiscount}%</strong> cap on this product line will automatically trigger Sales Manager or Finance approval routing during quote submission.
              </span>
            </div>

            {isManagerOrAdmin && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  onClick={handleSavePricingSpecs}
                  variant="primary"
                  size="sm"
                  isLoading={updateProductMutation.isPending}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Pricing & Governance Specs
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Configure primary and secondary catalog categories for this product line. Products can belong to multiple categories.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {allCategories?.map((cat) => {
                const isAssigned = currentProduct.categories?.some((c) => c.id === cat.id);
                const isPrimary = currentProduct.primaryCategory?.id === cat.id || currentProduct.category === cat.code;

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-colors ${isPrimary
                      ? 'bg-[#F3E9F1] border-[#714B67]'
                      : isAssigned
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{cat.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{cat.code}</span>
                      </div>
                      {isPrimary ? (
                        <span className="text-[10px] font-bold bg-[#714B67] text-white px-2 py-0.5 rounded shadow-xs">
                          PRIMARY CATEGORY
                        </span>
                      ) : (
                        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleSecondaryCategory(cat.id)}
                            className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
                          />
                          <span className="font-medium text-slate-700">Assigned</span>
                        </label>
                      )}
                    </div>

                    {!isPrimary && isManagerOrAdmin && (
                      <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                        <button
                          onClick={async () => {
                            try {
                              await updateProductMutation.mutateAsync({
                                id: currentProduct.id,
                                data: { category: cat.code as any },
                              });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-[11px] font-semibold text-[#714B67] hover:underline"
                        >
                          Make Primary Category
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ATTRIBUTES & VARIANTS */}
        {activeTab === 'variants' && (
          <div className="space-y-4 text-xs">
            {/* Attribute Manager */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Product Attribute Catalog
              </h3>
              <form onSubmit={handleCreateAttribute} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  placeholder="New Attribute Name (e.g. RAM, Storage, Color)"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
                <Button type="submit" size="sm" variant="primary" isLoading={createAttributeMutation.isPending}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Attribute
                </Button>
              </form>

              {attributes && attributes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {attributes.map((attr: ProductAttributeDto) => (
                    <div key={attr.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <span className="font-bold text-slate-800 block">{attr.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {attr.values?.map((val) => (
                          <span
                            key={val.id}
                            className="inline-flex items-center space-x-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700"
                          >
                            <span>{val.value}</span>
                            {isManagerOrAdmin && (
                              <button
                                onClick={() => deleteAttributeValueMutation.mutate(val.id)}
                                className="text-red-400 hover:text-red-600 p-0.5 ml-1"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="text"
                          value={newValueInputs[attr.id] || ''}
                          onChange={(e) => setNewValueInputs({ ...newValueInputs, [attr.id]: e.target.value })}
                          placeholder="New value (e.g. 64GB)"
                          className="flex-1 px-2 py-1 border border-slate-200 rounded text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddValue(attr.id)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variant List Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Configured Variants ({currentProduct.variants?.length || 0})
                </h3>
                {isManagerOrAdmin && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setEditingVariant(null);
                      setIsVariantModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Variant Option
                  </Button>
                )}
              </div>

              {!currentProduct.variants || currentProduct.variants.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-400">
                  No multi-attribute variants defined. Base SKU will be used for sales quotations.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {currentProduct.variants.map((v) => (
                    <div key={v.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#714B67]">{v.sku}</span>
                          <span className="font-semibold text-slate-800">{v.name}</span>
                          <Badge variant={v.isActive ? 'success' : 'default'} size="sm">
                            {v.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </div>
                        {v.attributes && v.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.attributes.map((a, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {a.attributeName}: <strong>{a.attributeValue}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-slate-900">
                          {v.extraPrice > 0 ? `+$${v.extraPrice.toFixed(2)}` : 'Standard Price'}
                        </span>
                        {isManagerOrAdmin && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingVariant(v);
                                setIsVariantModalOpen(true);
                              }}
                              className="text-slate-500 hover:text-slate-800 p-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(v.id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PRICE LISTS */}
        {activeTab === 'price-lists' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <Shield className="w-4 h-4 text-[#714B67]" />
                  <span>B2B Customer Tier & Currency Price List Governance</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Price Lists define contractual unit prices for specific Customer Tiers (ENTERPRISE, GOLD, SILVER, BRONZE) and Currencies (USD, EUR, GBP, INR). When a customer builds a quotation, the server automatically resolves the exact matching price list override.
                </p>
              </div>
              <Link to="/price-lists" className="shrink-0">
                <Button size="sm" variant="outline">
                  Manage All Price Lists
                </Button>
              </Link>
            </div>


            {priceLists && priceLists.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {priceLists.map((pl) => {
                  const entry = pl.entries?.find((e) => e.productId === currentProduct.id);
                  const currentPrice = entry ? entry.unitPrice : currentProduct.unitPrice;
                  const delta = currentPrice - currentProduct.unitPrice;
                  const percentDiscount = currentProduct.unitPrice > 0 ? ((delta / currentProduct.unitPrice) * 100).toFixed(1) : '0';

                  const tierColorMap: Record<string, string> = {
                    ENTERPRISE: 'bg-amber-100 text-amber-800 border-amber-300',
                    GOLD: 'bg-purple-100 text-purple-800 border-purple-300',
                    SILVER: 'bg-blue-100 text-blue-800 border-blue-300',
                    BRONZE: 'bg-slate-100 text-slate-800 border-slate-300',
                  };

                  return (
                    <div key={pl.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{pl.name}</span>
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${tierColorMap[pl.customerTier || ''] || 'bg-indigo-100 text-indigo-800 border-indigo-300'}`}>
                            {pl.customerTier || 'GLOBAL TIER'}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold rounded">
                            {pl.currency}
                          </span>
                        </div>

                        {entry ? (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Base Catalog: <span className="line-through">${currentProduct.unitPrice.toFixed(2)}</span>
                            <span className="ml-2 text-emerald-600 font-semibold">
                              Override: ${entry.unitPrice.toFixed(2)} ({delta < 0 ? `${percentDiscount}% Tier Savings` : `+$${delta.toFixed(2)}`})
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400">
                            No custom price entry. Base catalog price (${currentProduct.unitPrice.toFixed(2)}) applies.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={currentPrice}
                            onChange={(e) =>
                              setPriceOverrides({ ...priceOverrides, [pl.id]: parseFloat(e.target.value) || 0 })
                            }
                            className="w-28 pl-6 pr-2 py-1 font-mono font-bold border border-slate-200 rounded text-slate-900 bg-white"
                          />
                        </div>
                        {isManagerOrAdmin && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSavePriceListEntry(pl.id)}
                            isLoading={upsertPriceEntryMutation.isPending}
                          >
                            Set Tier Price
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-400">
                No Price Lists configured in system. Standard catalog list price applies.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: EFFECTIVE PRICE INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="space-y-4 text-xs">
            <div className="bg-gradient-to-r from-purple-50 to-slate-50 p-4 rounded-xl border border-purple-100 space-y-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-[#714B67]" />
                <h3 className="font-bold text-slate-900 text-sm">Effective Commercial Price Resolver</h3>
              </div>
              <p className="text-slate-500 text-[11px]">
                Simulate customer tier, currency, and variant selections to verify exact server-calculated price resolution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Tier</label>
                  <select
                    value={inspectorTier}
                    onChange={(e) => setInspectorTier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="ENTERPRISE">ENTERPRISE</option>
                    <option value="GOLD">GOLD</option>
                    <option value="SILVER">SILVER</option>
                    <option value="BRONZE">BRONZE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={inspectorCurrency}
                    onChange={(e) => setInspectorCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Variant Option</label>
                  <select
                    value={inspectorVariantId}
                    onChange={(e) => setInspectorVariantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="">Base Product (Standard Price)</option>
                    {currentProduct.variants?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (+${v.extraPrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Price Resolution Breakdown
              </h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Base Catalog Price / Tier Override:</span>
                  <span className="font-bold text-slate-900">${currentProduct.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Selected Variant Extra Delta:</span>
                  <span className="font-bold text-emerald-600">+${resolvedExtraPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm bg-slate-50 px-3 rounded-lg border border-slate-200">
                  <span className="font-sans font-bold text-slate-800">Final Resolved Effective Price:</span>
                  <span className="font-bold text-[#714B67] text-base">${finalEffectivePrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close Management Panel
          </Button>
        </div>
      </div>

      {/* Sub-Modal: Variant Builder */}
      <VariantBuilderModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        productId={currentProduct.id}
        productSku={currentProduct.sku}
        variantToEdit={editingVariant}
      />
    </div>
  );
};
