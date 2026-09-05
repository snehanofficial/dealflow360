import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePriceLists, useUpdatePriceList, useDeletePriceList } from '../products/useProducts.js';
import { useAuth } from '../auth/AuthContext.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { SearchInput } from '../../components/ui/SearchInput.js';
import { PriceListFormModal } from './PriceListFormModal.js';
import { PriceListDetailPage } from './PriceListDetailPage.js';
import {
  Tag,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Power,
  Globe,
  Shield,
  Layers,
  Check,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { PriceListDto } from '@dealflow360/contracts';

export const PriceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const isManagerOrAdmin = role === 'ADMIN' || role === 'SALES_MANAGER';

  const activeDetailId = searchParams.get('id');

  const { data: priceLists, isLoading, isError, error } = usePriceLists();
  const updatePriceListMutation = useUpdatePriceList();
  const deletePriceListMutation = useDeletePriceList();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [priceListToEdit, setPriceListToEdit] = useState<PriceListDto | null>(null);

  // Delete confirmation
  const [listToDelete, setListToDelete] = useState<PriceListDto | null>(null);

  if (activeDetailId) {
    return (
      <PriceListDetailPage
        priceListIdProp={activeDetailId}
        onBackProp={() => {
          searchParams.delete('id');
          setSearchParams(searchParams);
        }}
      />
    );
  }

  const handleOpenCreateModal = () => {
    setPriceListToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (list: PriceListDto) => {
    setPriceListToEdit(list);
    setIsCreateModalOpen(true);
  };

  const handleOpenDetails = (list: PriceListDto) => {
    setSearchParams({ id: list.id });
  };

  const handleToggleActive = async (list: PriceListDto) => {
    try {
      await updatePriceListMutation.mutateAsync({
        id: list.id,
        data: { isActive: !list.isActive },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!listToDelete) return;
    try {
      await deletePriceListMutation.mutateAsync(listToDelete.id);
      setListToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Price Lists
  const filteredLists = priceLists?.filter((list) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!list.name.toLowerCase().includes(q)) return false;
    }
    if (tierFilter) {
      if (tierFilter === 'GLOBAL') {
        if (list.customerTier !== null && list.customerTier !== undefined) return false;
      } else if (list.customerTier !== tierFilter) {
        return false;
      }
    }
    if (currencyFilter && list.currency !== currencyFilter) {
      return false;
    }
    if (statusFilter) {
      const activeState = statusFilter === 'ACTIVE';
      if (list.isActive !== activeState) return false;
    }
    return true;
  }) || [];

  const tierBadgeMap: Record<string, string> = {
    ENTERPRISE: 'bg-amber-100 text-amber-800 border-amber-300',
    TIER_1: 'bg-purple-100 text-purple-800 border-purple-300',
    TIER_2: 'bg-blue-100 text-blue-800 border-blue-300',
    TIER_3: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Tag className="w-6 h-6 text-[#714B67]" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Price List Governance</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Governed customer-tier and multi-currency pricing lists for sales quotations.
          </p>
        </div>

        {isManagerOrAdmin && (
          <div className="flex items-center space-x-2 sm:self-start">
            <Button onClick={handleOpenCreateModal} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Price List
            </Button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onDebouncedChange={(val) => setSearch(val)}
            isLoading={isLoading}
            placeholder="Search by price list name..."
            aria-label="Search price lists by name"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Tiers</option>
              <option value="GLOBAL">Global Tier (No Tier)</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
              <option value="TIER_1">TIER_1</option>
              <option value="TIER_2">TIER_2</option>
              <option value="TIER_3">TIER_3</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Currency:</span>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading price lists...</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600 text-sm">
            Failed to load price lists. {(error as Error)?.message}
          </div>
        ) : filteredLists.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Price Lists Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No price lists match your search or filter parameters. Try clearing filters or create a new price list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Price List Name</th>
                  <th className="py-3 px-4">Customer Tier</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4 text-right">Products Configured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Default Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLists.map((list) => {
                  const tierClass = tierBadgeMap[list.customerTier || ''] || 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr key={list.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <button
                          onClick={() => handleOpenDetails(list)}
                          className="font-bold text-[#714B67] hover:underline text-left"
                        >
                          {list.name}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${tierClass}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {list.customerTier || 'GLOBAL (ALL TIERS)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                        <span className="inline-flex items-center">
                          <Globe className="w-3 h-3 mr-1 text-slate-400" />
                          {list.currency}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {list.entries?.length || 0}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={list.isActive ? 'success' : 'default'} size="sm">
                          {list.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        {list.isDefault ? (
                          <span className="inline-flex items-center text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <Check className="w-3 h-3 mr-1" />
                            Default ({list.currency})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Standard</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenDetails(list)}
                            className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-medium p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            title="View Products & Prices"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Edit</span>
                          </button>

                          {isManagerOrAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(list)}
                                className="inline-flex items-center space-x-1 text-xs text-[#714B67] hover:text-[#55364e] font-medium p-1.5 rounded-md hover:bg-[#F3E9F1] transition-colors"
                                title="Edit Settings"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleActive(list)}
                                className={`inline-flex items-center p-1.5 rounded-md text-xs font-medium transition-colors ${
                                  list.isActive
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={list.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setListToDelete(list)}
                                className="inline-flex items-center p-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Price List"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PriceListFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        priceListToEdit={priceListToEdit}
      />

      {/* Delete Confirmation Modal */}
      {listToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Delete Price List?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>"{listToDelete.name}"</strong>? All configured tier pricing entries in this list will be permanently removed. Underlying catalog products will NOT be deleted.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setListToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={deletePriceListMutation.isPending}
              >
                Delete Price List
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
