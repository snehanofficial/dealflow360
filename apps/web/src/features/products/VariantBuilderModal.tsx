import React, { useState, useEffect } from 'react';
import { useAttributes, useCreateVariant, useUpdateVariant } from './useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { ProductVariantDto, ProductAttributeDto } from '@dealflow360/contracts';
import { X, Sliders, AlertCircle, Plus } from 'lucide-react';

interface VariantBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productSku: string;
  variantToEdit?: ProductVariantDto | null;
}

export const VariantBuilderModal: React.FC<VariantBuilderModalProps> = ({
  isOpen,
  onClose,
  productId,
  productSku,
  variantToEdit,
}) => {
  const { data: attributes } = useAttributes();
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();

  const isEditing = !!variantToEdit;
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [extraPrice, setExtraPrice] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (variantToEdit) {
      setSku(variantToEdit.sku);
      setName(variantToEdit.name);
      setExtraPrice(variantToEdit.extraPrice || 0);
      setIsActive(variantToEdit.isActive ?? true);

      // Preselect attribute value IDs if mapped
      const map: Record<string, string> = {};
      if (attributes && variantToEdit.attributes) {
        variantToEdit.attributes.forEach((attr) => {
          const foundAttr = attributes.find((a: ProductAttributeDto) => a.name === attr.attributeName);
          if (foundAttr) {
            const foundVal = foundAttr.values.find((v: { id: string; value: string }) => v.value === attr.attributeValue);
            if (foundVal) {
              map[foundAttr.id] = foundVal.id;
            }
          }
        });
      }
      setSelectedAttributeValues(map);
    } else {
      setSku(`${productSku}-VAR-${Date.now().toString().slice(-4)}`);
      setName('Custom Variant Option');
      setExtraPrice(0);
      setIsActive(true);
      setSelectedAttributeValues({});
    }
  }, [variantToEdit, isOpen, productSku, attributes]);

  if (!isOpen) return null;

  const handleAttributeSelect = (attributeId: string, valueId: string) => {
    setSelectedAttributeValues((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim()) {
      setError('Variant SKU is required.');
      return;
    }
    if (!name.trim()) {
      setError('Variant Name is required.');
      return;
    }

    const attributeValueIds = Object.values(selectedAttributeValues).filter(Boolean);

    try {
      if (isEditing && variantToEdit) {
        await updateVariantMutation.mutateAsync({
          productId,
          variantId: variantToEdit.id,
          data: {
            sku: sku.trim(),
            name: name.trim(),
            extraPrice,
            isActive,
            attributeValueIds,
          },
        });
      } else {
        await createVariantMutation.mutateAsync({
          productId,
          data: {
            sku: sku.trim(),
            name: name.trim(),
            extraPrice,
            isActive,
            attributeValueIds,
          },
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save variant option.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Product Variant' : 'Create Multi-Attribute Variant'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Variant SKU *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SRV-64-2TB"
                className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Variant Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Server 64GB RAM / 2TB Storage"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>

          {/* Attribute Selection Controls */}
          {attributes && attributes.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Select Variant Attributes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attributes.map((attr: ProductAttributeDto) => (
                  <div key={attr.id}>
                    <label className="block font-medium text-slate-600 mb-1">{attr.name}</label>
                    <select
                      value={selectedAttributeValues[attr.id] || ''}
                      onChange={(e) => handleAttributeSelect(attr.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                    >
                      <option value="">-- No Selection --</option>
                      {attr.values?.map((val) => (
                        <option key={val.id} value={val.id}>
                          {val.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Extra Price Delta ($) *</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">+$</span>
                <input
                  type="number"
                  step="0.01"
                  value={extraPrice}
                  onChange={(e) => setExtraPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Added to base list price upon selection</p>
            </div>

            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                id="variantIsActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
              />
              <label htmlFor="variantIsActive" className="ml-2 font-medium text-slate-700 select-none">
                Active variant option
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createVariantMutation.isPending || updateVariantMutation.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Variant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
