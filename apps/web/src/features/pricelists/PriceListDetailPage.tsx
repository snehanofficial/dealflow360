import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  usePriceList,
  useProducts,
  useUpdatePriceList,
  useDeletePriceList,
  useDeletePriceListEntry,
} from '../products/useProducts.js';
import { useAuth } from '../auth/AuthContext.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { SearchInput } from '../../components/ui/SearchInput.js';
import { PriceListFormModal } from './PriceListFormModal.js';
import { AddProductToPriceListModal } from './AddProductToPriceListModal.js';
import { EditPriceEntryModal } from './EditPriceEntryModal.js';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  DollarSign,
  Globe,
  Shield,
  Layers,
  Check,
  Power,
  AlertTriangle,
} from 'lucide-react';
import { ProductDto, PriceListEntryDto } from '@dealflow360/contracts';

interface PriceListDetailPageProps {
  priceListIdProp?: string;
  onBackProp?: () => void;
}

export const PriceListDetailPage: React.FC<PriceListDetailPageProps> = ({
  priceListIdProp,
  onBackProp,
}) => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isManagerOrAdmin = role === 'ADMIN' || role === 'SALES_MANAGER';

  const priceListId = priceListIdProp || routeId;

  const { data: priceList, isLoading, isError, error } = usePriceList(priceListId);
  const { data: productsData } = useProducts({ page: 1, limit: 200 });

  const updatePriceListMutation = useUpdatePriceList();
  const deletePriceListMutation = useDeletePriceList();
  const deleteEntryMutation = useDeletePriceListEntry();

  const [search, setSearch] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Entry edit state
  const [selectedEntry, setSelectedEntry] = useState<{ entry: PriceListEntryDto; product: ProductDto } | null>(null);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);

  // Confirm Delete Price List Dialog
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Confirm Delete Entry Dialog
  const [entryToDelete, setEntryToDelete] = useState<{ productId: string; name: string } | null>(null);

  const handleBack = () => {
    if (onBackProp) {
      onBackProp();
    } else {
      navigate('/price-lists');
    }
  };

  const handleToggleActive = async () => {
    if (!priceList) return;
    try {
      await updatePriceListMutation.mutateAsync({
        id: priceList.id,
        data: { isActive: !priceList.isActive },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePriceList = async () => {
    if (!priceList) return;
    try {
      await deletePriceListMutation.mutateAsync(priceList.id);
      handleBack();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveEntry = async () => {
    if (!priceList || !entryToDelete) return;
    try {
      await deleteEntryMutation.mutateAsync({
        priceListId: priceList.id,
        productId: entryToDelete.productId,
      });
      setEntryToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading Price List details...
      </div>
    );
  }

  if (isError || !priceList) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-red-600 text-sm font-semibold">
          Price List not found. {(error as Error)?.message}
        </div>
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Price Lists
        </Button>
      </div>
    );
  }

  // Filter entries inside price list based on search
  const filteredEntries = priceList.entries?.filter((entry: any) => {
    if (!search.trim()) return true;
    const prod = productsData?.items?.find((p) => p.id === entry.productId) || entry.product;
    if (!prod) return false;
    const q = search.toLowerCase();
    const nameStr = (prod.name || '').toLowerCase();
    const skuStr = (prod.sku || '').toLowerCase();
    return nameStr.includes(q) || skuStr.includes(q);
  }) || [];

  const currencySymbolMap: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const sym = currencySymbolMap[priceList.currency] || '$';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#714B67] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Price Lists
          </button>

          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{priceList.name}</h1>
            <Badge variant={priceList.isActive ? 'success' : 'default'} size="sm">
              {priceList.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
            {priceList.isDefault && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                DEFAULT FOR {priceList.currency}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
            <span className="flex items-center font-medium">
              <Shield className="w-3.5 h-3.5 mr-1 text-[#714B67]" />
              Customer Tier: <strong className="ml-1 text-slate-800">{priceList.customerTier || 'GLOBAL TIER'}</strong>
            </span>
            <span className="flex items-center font-medium">
              <Globe className="w-3.5 h-3.5 mr-1 text-[#714B67]" />
              Currency: <strong className="ml-1 text-slate-800">{priceList.currency}</strong>
            </span>
            <span className="flex items-center font-medium">
              <Layers className="w-3.5 h-3.5 mr-1 text-[#714B67]" />
              Products Configured: <strong className="ml-1 text-slate-800">{priceList.entries?.length || 0}</strong>
            </span>
          </div>
        </div>

        {isManagerOrAdmin && (
          <div className="flex flex-wrap items-center gap-2 sm:self-start">
            <Button
              onClick={handleToggleActive}
              variant="outline"
              size="sm"
              isLoading={updatePriceListMutation.isPending}
            >
              <Power className="w-3.5 h-3.5 mr-1.5" />
              {priceList.isActive ? 'Deactivate' : 'Activate'}
            </Button>

            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Details
            </Button>

            <Button onClick={() => setIsDeleteConfirmOpen(true)} variant="danger" size="sm">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete List
            </Button>

            <Button onClick={() => setIsAddProductModalOpen(true)} variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Customer Tier Override
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {priceList.customerTier || 'Global (All Tiers)'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Target customer tier governance level.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Commercial Currency
          </span>
          <div className="text-lg font-bold font-mono text-[#714B67] mt-1">
            {priceList.currency} ({sym})
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Explicit currency configured for quotes.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Total Product Overrides
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {priceList.entries?.length || 0} products
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Products with explicit pricing entries.
          </p>
        </div>
      </div>

      {/* Search & Entry Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onDebouncedChange={(val) => setSearch(val)}
              placeholder="Search products in this list..."
              aria-label="Search products in price list"
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredEntries.length}</span> of{' '}
            <span className="font-bold text-slate-800">{priceList.entries?.length || 0}</span> configured product prices
          </div>
        </div>

        {!filteredEntries || filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Product Prices Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search.trim()
                ? 'No configured products match your search query.'
                : 'This Price List currently has no custom product price overrides. Base catalog prices apply as default.'}
            </p>
            {isManagerOrAdmin && !search.trim() && (
              <Button onClick={() => setIsAddProductModalOpen(true)} variant="primary" size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-right">Base Catalog Price</th>
                  <th className="py-3 px-4 text-right">Price List Price ({priceList.currency})</th>
                  <th className="py-3 px-4 text-right">Effective Savings / Delta</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry: any) => {
                  const prod = productsData?.items?.find((p) => p.id === entry.productId) || entry.product;
                  const skuVal = prod?.sku || 'N/A';
                  const nameVal = prod?.name || 'Product Details Unavailable';
                  const basePrice = prod?.unitPrice ?? prod?.listPrice ?? 0;
                  const delta = entry.unitPrice - basePrice;
                  const percent = basePrice > 0 ? ((delta / basePrice) * 100).toFixed(1) : '0';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#714B67]">
                        {skuVal}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {prod ? (
                          <Link
                            to="/products"
                            className="hover:underline text-slate-900 hover:text-[#714B67]"
                          >
                            {nameVal}
                          </Link>
                        ) : (
                          nameVal
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-xs">
                        ${basePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {sym}{entry.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {delta < 0 ? (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {percent}% ({sym}{delta.toFixed(2)})
                          </span>
                        ) : delta > 0 ? (
                          <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            +{sym}{delta.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">Same as Base</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isManagerOrAdmin && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEntry({
                                  entry,
                                  product: prod || { id: entry.productId, sku: skuVal, name: nameVal, unitPrice: basePrice },
                                });
                                setIsEditEntryModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1 text-xs text-[#714B67] hover:text-[#55364e] font-medium p-1.5 rounded-md hover:bg-[#F3E9F1] transition-colors"
                              title="Edit Price"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Price</span>
                            </button>

                            <button
                              onClick={() =>
                                setEntryToDelete({
                                  productId: entry.productId,
                                  name: nameVal,
                                })
                              }
                              className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 font-medium p-1.5 rounded-md hover:bg-red-50 transition-colors"
                              title="Remove Product from Price List"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Modals */}
      <PriceListFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        priceListToEdit={priceList}
      />

      <AddProductToPriceListModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        priceList={priceList}
      />

      <EditPriceEntryModal
        isOpen={isEditEntryModalOpen}
        onClose={() => {
          setIsEditEntryModalOpen(false);
          setSelectedEntry(null);
        }}
        priceList={priceList}
        entry={selectedEntry?.entry || null}
        product={selectedEntry?.product || null}
      />

      {/* Confirm Delete Price List Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Delete Price List?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>"{priceList.name}"</strong>? All configured tier pricing entries in this list will be permanently removed. Underlying catalog products will NOT be deleted.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeletePriceList}
                isLoading={deletePriceListMutation.isPending}
              >
                Delete Price List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Entry Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Remove Product from Price List?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Remove <strong>"{entryToDelete.name}"</strong> from <strong>"{priceList.name}"</strong>? Existing catalog product data will not be deleted.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEntryToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemoveEntry}
                isLoading={deleteEntryMutation.isPending}
              >
                Remove Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
