import React, { useState } from 'react';
import { useProducts, useCreateProduct } from './useProducts.js';
import { ProductFormModal } from './ProductFormModal.js';
import { ProductDetailModal } from './ProductDetailPage.js';
import { CategoryManagementModal } from './CategoryManagementModal.js';
import { PriceListManagementModal } from './PriceListManagementModal.js';
import { useAuth } from '../auth/AuthContext.js';
import { Badge, Button, SearchInput } from '../../components/ui/index.js';
import {
  Package,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Layers,
  Tag,
  DollarSign,
} from 'lucide-react';
import {
  ProductDto,
  ProductCategory,
  ProductType,
  CreateProductRequest,
  ProductCategoryEnum,
} from '@dealflow360/contracts';

export const ProductListPage: React.FC = () => {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [initialDetailTab, setInitialDetailTab] = useState<'general' | 'pricing' | 'categories' | 'variants' | 'price-lists' | 'inspector'>('general');
  const [formError, setFormError] = useState<string | null>(null);

  const queryParams = {
    search: search.trim() || undefined,
    category: (categoryFilter as ProductCategory) || undefined,
    type: (typeFilter as ProductType) || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error } = useProducts(queryParams);
  const createProductMutation = useCreateProduct();

  const isManagerOrAdmin = role === 'ADMIN' || role === 'SALES_MANAGER';

  const handleOpenCreateModal = () => {
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenManageModal = (product: ProductDto, tab: 'general' | 'pricing' = 'general') => {
    setSelectedProduct(product);
    setInitialDetailTab(tab);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: CreateProductRequest) => {
    setFormError(null);
    try {
      const createdProduct = await createProductMutation.mutateAsync(formData);
      setIsFormModalOpen(false);
      
      // Auto-open detail management page for newly created product
      if (createdProduct) {
        setSelectedProduct(createdProduct);
        setInitialDetailTab('general');
        setIsDetailModalOpen(true);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        setFormError(responseData?.message || 'An error occurred while creating product.');
      } else {
        setFormError('Failed to create product specification. Please try again.');
      }
    }
  };

  const categoryBadgeMap: Record<ProductCategory, 'purple' | 'info' | 'warning' | 'default' | 'success'> = {
    HARDWARE: 'purple',
    SOFTWARE_LICENSE: 'info',
    SUBSCRIPTION: 'success',
    PROFESSIONAL_SERVICES: 'warning',
    SUPPORT: 'default',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-[#714B67]" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog & Base Pricing</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Governed product offerings, unit of measure, base list prices, standard costs, and tax rules.
          </p>
        </div>

        {isManagerOrAdmin && (
          <div className="flex flex-wrap items-center gap-2 sm:self-start">
            <Button onClick={() => setIsCategoryModalOpen(true)} variant="outline" size="sm">
              <Tag className="w-4 h-4 mr-1.5" />
              Categories
            </Button>

            <Button onClick={() => setIsPriceListModalOpen(true)} variant="outline" size="sm">
              <DollarSign className="w-4 h-4 mr-1.5" />
              Price Lists
            </Button>

            <Button onClick={handleOpenCreateModal} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onDebouncedChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            isLoading={isLoading}
            placeholder="Search SKU, product name..."
            aria-label="Search products by SKU or name"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Categories</option>
              {ProductCategoryEnum.options.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Types</option>
              <option value="ONE_TIME">One Time</option>
              <option value="RECURRING">Recurring</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading product catalog...</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600 text-sm">
            Failed to load products. {(error as Error)?.message}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Products Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No products match your search or category filter. Try adjusting your parameters or add a new product line.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Tax Rate</th>
                  <th className="py-3 px-4 text-right">Max Discount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#714B67]">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>
                        <div>{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-[#714B67] truncate max-w-xs">{product.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={categoryBadgeMap[product.category] || 'default'} size="sm">
                        {product.primaryCategory?.name || product.category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {product.unit || 'Unit'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      ${product.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-600">
                      {product.taxRate ?? 0}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center font-mono text-xs font-semibold text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded">
                        {product.maxAllowedDiscount}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenManageModal(product, 'general')}
                          className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-medium p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                          title="View & Manage Product"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>

                        {isManagerOrAdmin && (
                          <button
                            onClick={() => handleOpenManageModal(product, 'pricing')}
                            className="inline-flex items-center space-x-1 text-xs text-[#714B67] hover:text-[#55364e] font-medium p-1.5 rounded-md hover:bg-[#F3E9F1] transition-colors"
                            title="Edit Product Pricing & Governance"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-700">{data.page}</span> of{' '}
              <span className="font-semibold text-slate-700">{data.totalPages}</span> ({data.total} total products)
            </span>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createProductMutation.isPending}
        apiError={formError}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        initialTab={initialDetailTab}
        isManagerOrAdmin={isManagerOrAdmin}
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <PriceListManagementModal
        isOpen={isPriceListModalOpen}
        onClose={() => setIsPriceListModalOpen(false)}
      />
    </div>
  );
};
