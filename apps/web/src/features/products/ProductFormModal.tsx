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
import { Button } from '../../components/ui/Button.js';
import { AlertCircle, X } from 'lucide-react';

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
      type: 'ONE_TIME' as ProductType,
      unitPrice: 100,
      costPrice: 60,
      maxAllowedDiscount: 15,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        sku: initialData.sku,
        name: initialData.name,
        description: initialData.description || '',
        category: initialData.category,
        type: initialData.type,
        unitPrice: initialData.unitPrice,
        costPrice: initialData.costPrice,
        maxAllowedDiscount: initialData.maxAllowedDiscount,
        isActive: initialData.isActive,
      });
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        category: 'HARDWARE',
        type: 'ONE_TIME',
        unitPrice: 100,
        costPrice: 60,
        maxAllowedDiscount: 15,
        isActive: true,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateProductRequest) => {
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

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
                Product Category *
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price ($) *
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
                Cost Price ($) *
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
