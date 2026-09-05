import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { useCategories } from './useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { AlertCircle, X, Package } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  isLoading?: boolean;
  apiError?: string | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  apiError = null,
}) => {
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category: 'HARDWARE' as ProductCategory,
      additionalCategoryIds: [],
      type: 'ONE_TIME' as ProductType,
      unit: 'Unit',
      taxRate: 0,
      unitPrice: 100,
      costPrice: 60,
      maxAllowedDiscount: 15,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        sku: `HW-PROD-${Date.now().toString().slice(-4)}`,
        name: '',
        description: '',
        category: 'HARDWARE',
        additionalCategoryIds: [],
        type: 'ONE_TIME',
        unit: 'Unit',
        taxRate: 0,
        unitPrice: 100,
        costPrice: 60,
        maxAllowedDiscount: 15,
        isActive: true,
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateProductRequest) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-lg font-bold text-slate-900">Add New Catalog Product</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 text-xs">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Section 1: Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SKU (Stock Keeping Unit) *
              </label>
              <input
                {...register('sku')}
                placeholder="e.g. HW-SRV-001"
                className={`w-full font-mono px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                  errors.sku ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                }`}
              />
              {errors.sku && <p className="text-[11px] text-red-500 mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                {...register('name')}
                placeholder="e.g. Enterprise Rack Server X100"
                className={`w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                  errors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Commercial specifications and technical details..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Section 2: Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Category *</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                {ProductCategoryEnum.options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Type *</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              >
                {ProductTypeEnum.options.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Commercial Unit & Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure *</label>
              <input
                {...register('unit')}
                placeholder="e.g. Unit, License, Hour, User/Month"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Tax Rate (%) *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('taxRate', { valueAsNumber: true })}
                  placeholder="0.0"
                  className="w-full pl-3 pr-6 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
                <span className="absolute right-2.5 top-2 text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Section 4: Base Pricing & Margins */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base List Price ($) *</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('unitPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={`w-full pl-6 pr-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.unitPrice ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.unitPrice && <p className="text-[11px] text-red-500 mt-1">{errors.unitPrice.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Cost ($) *</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('costPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={`w-full pl-6 pr-3 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.costPrice ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                  }`}
                />
              </div>
              {errors.costPrice && <p className="text-[11px] text-red-500 mt-1">{errors.costPrice.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Discount Cap (%) *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('maxAllowedDiscount', { valueAsNumber: true })}
                  placeholder="15"
                  className={`w-full pl-3 pr-6 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.maxAllowedDiscount ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#714B67]'
                  }`}
                />
                <span className="absolute right-2.5 top-2 text-slate-400">%</span>
              </div>
              {errors.maxAllowedDiscount && <p className="text-[11px] text-red-500 mt-1">{errors.maxAllowedDiscount.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveForm"
              {...register('isActive')}
              className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
            />
            <label htmlFor="isActiveForm" className="font-medium text-slate-700 select-none">
              Active product offering in catalog
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create Product & Manage Specs
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
