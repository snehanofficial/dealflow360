import React from 'react';
import { ProductDto } from '@dealflow360/contracts';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { ShieldAlert, X, Tag, Percent, Layers, DollarSign } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductDto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: ProductDto) => void;
  isManagerOrAdmin?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  isManagerOrAdmin = false,
}) => {
  if (!isOpen || !product) return null;

  const grossProfit = product.unitPrice - product.costPrice;
  const marginPercent = product.unitPrice > 0 ? ((grossProfit / product.unitPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 p-6 space-y-6">
        {/* Header Summary */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded">
                {product.sku}
              </span>
              <Badge variant={product.isActive ? 'success' : 'default'} size="sm">
                {product.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{product.name}</h2>
            {product.description && (
              <p className="text-xs text-slate-500 mt-1">{product.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commercial Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Selling Price
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              ${product.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {product.unit || 'Unit'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Standard Cost
            </span>
            <span className="text-base font-bold text-slate-700 mt-0.5 block">
              ${product.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              List Profit Margin
            </span>
            <span className="text-base font-bold text-emerald-800 mt-0.5 block">
              {marginPercent}%
            </span>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
              Max Discount Cap
            </span>
            <span className="text-base font-bold text-[#714B67] mt-0.5 block">
              {product.maxAllowedDiscount}%
            </span>
          </div>
        </div>

        {/* Categorization & Tax Specs */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Classification & Tax Metadata
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Primary Category</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {product.primaryCategory?.name || product.category.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Billing Type</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {product.type.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Unit of Measure</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {product.unit || 'Unit'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Tax Rate</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {product.taxRate ?? 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Variants Breakdown */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Product Variants ({product.variants.length})
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
              {product.variants.map((variant) => (
                <div key={variant.id} className="p-2.5 flex items-center justify-between bg-white">
                  <div>
                    <span className="font-mono font-semibold text-[#714B67] mr-2">{variant.sku}</span>
                    <span className="font-medium text-slate-800">{variant.name}</span>
                  </div>
                  <span className="font-mono text-slate-700 font-semibold">
                    {variant.extraPrice > 0 ? `+$${variant.extraPrice.toFixed(2)}` : 'Standard Price'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Governance Note */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2 text-amber-800 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Discounts exceeding the <strong>{product.maxAllowedDiscount}%</strong> cap on this product line will automatically trigger Sales Manager or Finance approval requirements.
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isManagerOrAdmin && onEdit && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              Edit Product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
