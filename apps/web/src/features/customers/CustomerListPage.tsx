import React, { useState } from 'react';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from './useCustomers.js';
import { CustomerFormModal } from './CustomerFormModal.js';
import { useAuth } from '../auth/AuthContext.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import {
  Users,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { CustomerDto, CustomerTier, CustomerStatus, CreateCustomerRequest } from '@dealflow360/contracts';

export const CustomerListPage: React.FC = () => {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const queryParams = {
    search: search.trim() || undefined,
    tier: (tierFilter as CustomerTier) || undefined,
    status: (statusFilter as CustomerStatus) || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error } = useCustomers(queryParams);
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const isManagerOrAdmin = role === 'ADMIN' || role === 'SALES_MANAGER';

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: CustomerDto) => {
    setEditingCustomer(customer);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: CreateCustomerRequest) => {
    setFormError(null);
    try {
      if (editingCustomer) {
        await updateCustomerMutation.mutateAsync({
          id: editingCustomer.id,
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            tier: formData.tier,
            status: formData.status,
          },
        });
      } else {
        await createCustomerMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        setFormError(responseData?.message || 'An error occurred while saving the customer.');
      } else {
        setFormError('Failed to save customer account. Please try again.');
      }
    }
  };

  const tierBadgeMap: Record<CustomerTier, 'purple' | 'info' | 'warning' | 'default'> = {
    ENTERPRISE: 'purple',
    TIER_1: 'info',
    TIER_2: 'warning',
    TIER_3: 'default',
  };

  const statusBadgeMap: Record<CustomerStatus, 'success' | 'default' | 'danger'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'danger',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#714B67]" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Management</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise customer accounts, discount tiers, and status governance.
          </p>
        </div>

        <Button onClick={handleOpenCreateModal} variant="primary" className="sm:self-start">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search code, name, email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Tiers</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="TIER_1">Tier 1</option>
              <option value="TIER_2">Tier 2</option>
              <option value="TIER_3">Tier 3</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading customer directory...</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600 text-sm">
            Failed to load customers. {(error as Error)?.message}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Customers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No customer records match your filter parameters. Try adjusting your search query or add a new customer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#714B67]">
                      {customer.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {customer.phone ? (
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={tierBadgeMap[customer.tier as CustomerTier] || 'default'} size="sm">
                        {customer.tier.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadgeMap[customer.status as CustomerStatus] || 'default'} size="sm">
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isManagerOrAdmin ? (
                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          className="inline-flex items-center space-x-1 text-xs text-[#714B67] hover:text-[#55364e] font-medium p-1.5 rounded-md hover:bg-[#F3E9F1] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-end">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-300" /> View Only
                        </span>
                      )}
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
              <span className="font-semibold text-slate-700">{data.totalPages}</span> ({data.total} total customers)
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

      {/* Customer Create/Edit Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCustomer}
        isLoading={createCustomerMutation.isPending || updateCustomerMutation.isPending}
        apiError={formError}
      />
    </div>
  );
};
