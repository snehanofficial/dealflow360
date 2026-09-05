import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateProductSchema,
  CreateProductRequest,
  ProductDto,
  ProductCategoryEnum,
  ProductTypeEnum,
  ProductCategory,
  ProductType,
} from '@dealflow360/contracts';
import { Button } from '../../components/ui/Button.js';
import { AlertCircle, X, Plus, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  initialData?: ProductDto | null;
  isLoading?: boolean;
  apiError?: string | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  apiError = null,
}) => {
  const isEditing = !!initialData;
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'variants'>('general');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category: 'HARDWARE' as ProductCategory,
      type: 'ONE_TIME' as ProductType,
      unit: 'Unit',
      taxRate: 0,
      unitPrice: 100,
      costPrice: 60,
      maxAllowedDiscount: 15,
      isActive: true,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        sku: initialData.sku,
        name: initialData.name,
        description: initialData.description || '',
        category: initialData.category,
        type: initialData.type,
        unit: initialData.unit || 'Unit',
        taxRate: initialData.taxRate ?? 0,
        unitPrice: initialData.unitPrice,
        costPrice: initialData.costPrice,
        maxAllowedDiscount: initialData.maxAllowedDiscount,
        isActive: initialData.isActive,
        variants: initialData.variants
          ? initialData.variants.map((v) => ({
              sku: v.sku,
              name: v.name,
              extraPrice: v.extraPrice,
              attributes: v.attributes || [],
            }))
          : [],
      });
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        category: 'HARDWARE',
        type: 'ONE_TIME',
        unit: 'Unit',
        taxRate: 0,
        unitPrice: 100,
        costPrice: 60,
        maxAllowedDiscount: 15,
        isActive: true,
        variants: [],
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateProductRequest) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Product Specification' : 'Add New Catalog Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 space-x-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            General Info & Tax
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'pricing'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Base Pricing & Margins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'variants'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Variants ({fields.length})
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <input
                    {...register('sku')}
                    disabled={isEditing}
                    placeholder="e.g. HW-SRV-001"
                    className={`w-full text-xs font-mono px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                      errors.sku ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                    } ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {errors.sku && <p className="text-[11px] text-red-500 mt-1">{errors.sku.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    {...register('name')}
                    placeholder="e.g. Enterprise Rack Server"
                    className={`w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                      errors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Product commercial details and technical specifications..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  >
                    {ProductCategoryEnum.options.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Type *
                  </label>
                  <select
                    {...register('type')}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  >
                    {ProductTypeEnum.options.map((t) => (
                      <option key={t} value={t}>
                        {t.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit of Measure *
                  </label>
                  <input
                    {...register('unit')}
                    placeholder="e.g. Unit, License, Hour, User/Month"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used on quotation and billing lines</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Tax Rate (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register('taxRate', { valueAsNumber: true })}
                      placeholder="0.0"
                      className="w-full text-xs pl-3 pr-6 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">VAT / GST applied on quote totals</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700 select-none">
                  Active product in commercial catalog
                </label>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Selling Price ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register('unitPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={`w-full text-xs pl-6 pr-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                        errors.unitPrice ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                      }`}
                    />
                  </div>
                  {errors.unitPrice && <p className="text-[11px] text-red-500 mt-1">{errors.unitPrice.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Cost ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register('costPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={`w-full text-xs pl-6 pr-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                        errors.costPrice ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                      }`}
                    />
                  </div>
                  {errors.costPrice && <p className="text-[11px] text-red-500 mt-1">{errors.costPrice.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Allowed Discount (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register('maxAllowedDiscount', { valueAsNumber: true })}
                      placeholder="15"
                      className={`w-full text-xs pl-3 pr-6 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                        errors.maxAllowedDiscount ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                      }`}
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">%</span>
                  </div>
                  {errors.maxAllowedDiscount && <p className="text-[11px] text-red-500 mt-1">{errors.maxAllowedDiscount.message}</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Configure multi-attribute product SKUs and extra pricing deltas.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({
                      sku: `${initialData?.sku || 'SKU'}-VAR-${fields.length + 1}`,
                      name: 'Option Variant',
                      extraPrice: 50,
                      attributes: [{ attributeName: 'Option', attributeValue: 'Standard' }],
                    })
                  }
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Variant
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                  No custom variants defined for this product. Base SKU will be used.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Variant #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          {...register(`variants.${index}.sku` as const)}
                          placeholder="Variant SKU"
                          className="text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                        />
                        <input
                          {...register(`variants.${index}.name` as const)}
                          placeholder="Variant Name"
                          className="text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-slate-400 text-xs">+$</span>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`variants.${index}.extraPrice` as const, { valueAsNumber: true })}
                            placeholder="Extra Price"
                            className="w-full text-xs pl-6 pr-2 py-1.5 border border-slate-200 rounded bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
