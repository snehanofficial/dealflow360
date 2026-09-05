import React, { useState, useEffect } from 'react';
import {
  useCategories,
  useCategoryDetail,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpsertCategoryDiscountPolicy,
} from './useProducts.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  X,
  Plus,
  Tag,
  AlertCircle,
  Check,
  Percent,
  Layers,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Edit2,
  Package,
  Search,
  ShieldAlert,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: categories, isLoading: isListLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const upsertPolicyMutation = useUpsertCategoryDiscountPolicy();

  // Active view: 'LIST' | 'INTERIOR_FLOW'
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Category Detail Hook
  const { data: categoryDetail, isLoading: isDetailLoading } = useCategoryDetail(selectedCategoryId || undefined);

  // Form states for Create Category
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [createDesc, setCreateDesc] = useState('');

  // Form states for Category Interior Flow / Detail Editing
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  // Form states for Category Discount Policy Customization
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<number>(15);
  const [minMarginPercent, setMinMarginPercent] = useState<number>(30);
  const [requiredApprovalRole, setRequiredApprovalRole] = useState<string>('SALES_MANAGER');
  const [customerTier, setCustomerTier] = useState<string>('GLOBAL');

  // Products filter inside interior flow
  const [productSearch, setProductSearch] = useState('');

  // Status alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate detail editing state when categoryDetail is loaded
  useEffect(() => {
    if (categoryDetail) {
      setEditName(categoryDetail.name || '');
      setEditCode(categoryDetail.code || '');
      setEditDesc(categoryDetail.description || '');

      const policy = categoryDetail.discountPolicies?.[0];
      if (policy) {
        setMaxDiscountPercent(policy.maxDiscountPercent ?? 15);
        setMinMarginPercent(policy.minMarginPercent ?? 30);
        setRequiredApprovalRole(policy.requiredApprovalRole || 'SALES_MANAGER');
        setCustomerTier(policy.customerTier || 'GLOBAL');
      } else {
        setMaxDiscountPercent(15);
        setMinMarginPercent(30);
        setRequiredApprovalRole('SALES_MANAGER');
        setCustomerTier('GLOBAL');
      }
    }
  }, [categoryDetail]);

  if (!isOpen) return null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!createName.trim() || !createCode.trim()) {
      setError('Category Name and Code are required.');
      return;
    }

    try {
      const created = await createCategoryMutation.mutateAsync({
        name: createName.trim(),
        code: createCode.trim().toUpperCase().replace(/\s+/g, '_'),
        description: createDesc.trim() || undefined,
      });
      setCreateName('');
      setCreateCode('');
      setCreateDesc('');
      setIsCreating(false);
      setSuccess('Category created successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setSelectedCategoryId(created.id);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleUpdateCategoryMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;
    setError(null);
    setSuccess(null);

    try {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategoryId,
        data: {
          name: editName.trim(),
          code: editCode.trim().toUpperCase().replace(/\s+/g, '_'),
          description: editDesc.trim() || undefined,
        },
      });
      setIsEditingMetadata(false);
      setSuccess('Category details updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update category details.');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setError(null);
    setSuccess(null);

    try {
      await deleteCategoryMutation.mutateAsync(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
      setSuccess(`Category "${name}" deleted.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete category.');
    }
  };

  const handleSaveDiscountPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;
    setError(null);
    setSuccess(null);

    try {
      await upsertPolicyMutation.mutateAsync({
        id: selectedCategoryId,
        data: {
          maxDiscountPercent: Number(maxDiscountPercent),
          minMarginPercent: minMarginPercent !== undefined ? Number(minMarginPercent) : null,
          requiredApprovalRole,
          customerTier: customerTier === 'GLOBAL' ? null : customerTier,
        },
      });
      setSuccess('Category discount policy saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save discount policy.');
    }
  };

  const filteredProducts = categoryDetail?.products?.filter((p: any) => {
    if (!productSearch) return true;
    const term = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.billingType.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            {selectedCategoryId ? (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                title="Back to Categories"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2 bg-[#F3E9F1] text-[#714B67] rounded-xl">
                <Tag className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {selectedCategoryId ? (
                  <>
                    <span>Category Flow:</span>
                    <span className="text-[#714B67]">{categoryDetail?.name || 'Loading...'}</span>
                  </>
                ) : (
                  'Category Manager & Governance Policies'
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedCategoryId
                  ? 'Configure category-wise discount rules and manage assigned products.'
                  : 'Manage product categories and category-level discount customization.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-700 text-xs shrink-0">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!selectedCategoryId ? (
            /* ==================== MASTER CATEGORY LIST VIEW ==================== */
            <div className="space-y-5">
              
              {/* Top Controls: Search / Create Trigger */}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Product Categories ({categories?.length || 0})
                </h3>
                <Button
                  size="sm"
                  variant={isCreating ? 'outline' : 'primary'}
                  onClick={() => setIsCreating(!isCreating)}
                >
                  {isCreating ? (
                    'Cancel'
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add New Category
                    </>
                  )}
                </Button>
              </div>

              {/* Create Category Form */}
              {isCreating && (
                <form
                  onSubmit={handleCreateCategory}
                  className="p-4 bg-slate-50 border border-[#714B67]/20 rounded-2xl space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-[#714B67] uppercase tracking-wider">Create New Category</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={createName}
                        onChange={(e) => {
                          setCreateName(e.target.value);
                          if (!createCode) {
                            setCreateCode(e.target.value.toUpperCase().replace(/\s+/g, '_'));
                          }
                        }}
                        placeholder="e.g. Cloud Infrastructure"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Category Code *</label>
                      <input
                        type="text"
                        value={createCode}
                        onChange={(e) => setCreateCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                        placeholder="e.g. CLOUD_INFRA"
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      placeholder="Brief category summary..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button type="submit" size="sm" variant="primary" isLoading={createCategoryMutation.isPending}>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Save & Create Category
                    </Button>
                  </div>
                </form>
              )}

              {/* Categories Grid / Cards */}
              {isListLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading category list...</div>
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat: any) => {
                    const policy = cat.discountPolicy;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-[#714B67] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm group-hover:text-[#714B67] transition-colors">
                                {cat.name}
                              </span>
                              <span className="font-mono text-[11px] text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded-md font-medium">
                                {cat.code}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat.id, cat.name);
                              }}
                              className="text-slate-300 hover:text-red-600 p-1 rounded transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {cat.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{cat.description}</p>
                          )}

                          {/* Discount Policy Indicator */}
                          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 my-2 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-slate-600 font-medium">
                              <span className="flex items-center gap-1">
                                <Percent className="w-3.5 h-3.5 text-[#714B67]" />
                                Max Discount Limit:
                              </span>
                              <span className="font-bold text-slate-900">
                                {policy ? `${policy.maxDiscountPercent}%` : '15% (Default)'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Min Margin:</span>
                              <span className="font-semibold text-slate-700">
                                {policy?.minMarginPercent ? `${policy.minMarginPercent}%` : '30%'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Approval Role:</span>
                              <Badge variant={policy?.requiredApprovalRole === 'FINANCE' ? 'warning' : 'info'} size="sm">
                                {policy?.requiredApprovalRole || 'SALES_MANAGER'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            {cat.productCount ?? 0} Products
                          </span>
                          <span className="text-[#714B67] font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                            Open Flow <ChevronRight className="w-4 h-4 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                  No categories found. Click "Add New Category" above to create one.
                </div>
              )}
            </div>
          ) : (
            /* ==================== CATEGORY INTERIOR FLOW VIEW ==================== */
            <div className="space-y-6">
              {isDetailLoading || !categoryDetail ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading category details...</div>
              ) : (
                <>
                  {/* Category Metadata Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-[#714B67] text-white rounded-xl">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{categoryDetail.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded font-bold">
                              {categoryDetail.code}
                            </span>
                            <span className="text-xs text-slate-500">
                              · {categoryDetail.products?.length || 0} Products assigned
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        {isEditingMetadata ? 'Cancel Edit' : 'Edit Details'}
                      </Button>
                    </div>

                    {isEditingMetadata ? (
                      <form onSubmit={handleUpdateCategoryMetadata} className="pt-3 border-t border-slate-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Category Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Category Code</label>
                            <input
                              type="text"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                              className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" size="sm" variant="primary" isLoading={updateCategoryMutation.isPending}>
                            Save Metadata
                          </Button>
                        </div>
                      </form>
                    ) : (
                      categoryDetail.description && (
                        <p className="text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                          {categoryDetail.description}
                        </p>
                      )
                    )}
                  </div>

                  {/* Category-Wise Discount Setting & Customization */}
                  <form
                    onSubmit={handleSaveDiscountPolicy}
                    className="bg-white border border-[#714B67]/30 rounded-2xl p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-5 h-5 text-[#714B67]" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Category-Wise Discount & Governance Settings
                        </h4>
                      </div>
                      <Badge variant="purple" size="sm">
                        Policy Engine Integrated
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500">
                      Customize category-specific discount boundaries and margin policies. Quotations violating these threshold limits will trigger automatic governance risk scoring and approval routing.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Max Discount % */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Max Discount Allowed (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={maxDiscountPercent}
                            onChange={(e) => setMaxDiscountPercent(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 font-bold"
                          />
                          <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>
                      </div>

                      {/* Min Margin % */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Min Margin Required (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={minMarginPercent}
                            onChange={(e) => setMinMarginPercent(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 font-bold"
                          />
                          <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>
                      </div>

                      {/* Required Approval Role */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Required Approval Role
                        </label>
                        <select
                          value={requiredApprovalRole}
                          onChange={(e) => setRequiredApprovalRole(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 font-semibold"
                        >
                          <option value="SALES_MANAGER">Sales Manager</option>
                          <option value="FINANCE_OPERATIONS">Finance Operations</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>

                      {/* Scope Customer Tier */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Customer Tier Scope
                        </label>
                        <select
                          value={customerTier}
                          onChange={(e) => setCustomerTier(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 font-semibold"
                        >
                          <option value="GLOBAL">All Tiers (Global)</option>
                          <option value="ENTERPRISE">Enterprise Tier Only</option>
                          <option value="GOLD">Gold Tier Only</option>
                          <option value="SILVER">Silver Tier Only</option>
                          <option value="BRONZE">Bronze Tier Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-[11px] text-slate-500 gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#714B67]" />
                        <span>Enforced on quote line pricing evaluation</span>
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        variant="primary"
                        isLoading={upsertPolicyMutation.isPending}
                      >
                        Save Category Policy
                      </Button>
                    </div>
                  </form>

                  {/* Interior Flow: Products Roster */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#714B67]" />
                        Products in {categoryDetail.name} ({filteredProducts.length})
                      </h4>
                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products in category..."
                          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                        />
                      </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                              <tr>
                                <th className="p-3">SKU & Name</th>
                                <th className="p-3">Type</th>
                                <th className="p-3 text-right">Unit Price</th>
                                <th className="p-3 text-right">Standard Cost</th>
                                <th className="p-3 text-right">Max Discount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredProducts.map((prod: any) => (
                                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3">
                                    <div className="font-semibold text-slate-900">{prod.name}</div>
                                    <div className="font-mono text-[11px] text-slate-400">{prod.sku}</div>
                                  </td>
                                  <td className="p-3">
                                    <Badge variant={prod.billingType === 'RECURRING' ? 'info' : 'default'} size="sm">
                                      {prod.billingType === 'RECURRING' ? 'Subscription' : 'One-Time'}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right font-mono font-semibold text-slate-900">
                                    ${Number(prod.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-600">
                                    ${Number(prod.standardCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-3 text-right font-mono font-semibold text-[#714B67]">
                                    {prod.maxAllowedDiscount}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                        No products found matching "{productSearch}" in this category.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-400">
            {selectedCategoryId ? 'Interior Flow View' : 'Master Category Catalog'}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Manager
          </Button>
        </div>

      </div>
    </div>
  );
};

