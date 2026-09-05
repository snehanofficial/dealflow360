import React, { useState } from 'react';
import { useCategories, useCreateCategory } from './useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { X, Plus, Tag, AlertCircle, Check } from 'lucide-react';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: categories, isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !code.trim()) {
      setError('Category Name and Category Code are required.');
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase().replace(/\s+/g, '_'),
      });
      setName('');
      setCode('');
      setSuccess('Category created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create category.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-base font-bold text-slate-900">Catalog Category Manager</h2>
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

        {/* Add Category Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Add New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'));
                  }
                }}
                placeholder="e.g. Data Center"
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="e.g. DATA_CENTER"
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={createCategoryMutation.isPending}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Category
            </Button>
          </div>
        </form>

        {/* Existing Categories Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Available Categories ({categories?.length || 0})
          </h3>
          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading categories...</div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
              {categories?.map((cat) => (
                <div key={cat.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="font-mono text-[11px] text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded">
                    {cat.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
