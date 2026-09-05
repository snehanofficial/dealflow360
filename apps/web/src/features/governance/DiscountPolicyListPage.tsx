import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Filter,
  Layers,
  Edit2,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  useDiscountPolicies,
  useToggleDiscountPolicyStatus,
  useDeleteDiscountPolicy,
} from './useDiscountPolicies.js';
import { DiscountPolicyRuleDto } from '@dealflow360/contracts';
import { DiscountPolicyFormModal } from './DiscountPolicyFormModal.js';
import { PolicySimulatorSection } from './PolicySimulatorSection.js';
import { Badge, Button, SearchInput, Card } from '../../components/ui/index.js';

export const DiscountPolicyListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'simulator'>('matrix');

  // Filter States
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountPolicyRuleDto | null>(null);

  // Queries & Mutations
  const { data: policies = [], isLoading, isError, error } = useDiscountPolicies({
    search: search.trim() || undefined,
    customerTier: tierFilter || undefined,
    category: categoryFilter || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  });

  const toggleStatusMutation = useToggleDiscountPolicyStatus();
  const deleteMutation = useDeleteDiscountPolicy();

  const handleCreateNew = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: DiscountPolicyRuleDto) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (rule: DiscountPolicyRuleDto) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: rule.id, isActive: !rule.isActive });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update rule status.');
    }
  };

  const handleDelete = async (rule: DiscountPolicyRuleDto) => {
    if (window.confirm(`Are you sure you want to delete policy rule "${rule.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(rule.id);
      } catch (err: any) {
        alert(err.response?.data?.error?.message || 'Failed to delete policy rule.');
      }
    }
  };

  const activeCount = policies.filter((p: DiscountPolicyRuleDto) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header Following Design System */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-[#714B67]" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Discount Policy Governance & Margin Matrix
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Govern allowable discounts, minimum margins, risk evaluation, and automatic approval routing across customer tiers and product categories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={handleCreateNew} variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Policy Rule
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'matrix'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Governance Policy Matrix ({policies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'simulator'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Interactive Deal Scenario Simulator</span>
        </button>
      </div>

      {/* Tab 1: Governance Policy Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Defined Policies</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{policies.length}</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Policy Rules</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Server Authority</div>
              <div className="text-sm font-semibold text-[#714B67] mt-2 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Deterministic Risk Engine</span>
              </div>
            </Card>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search policy name, category..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>Filters:</span>
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="">All Customer Tiers</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
                <option value="TIER_1">TIER_1</option>
                <option value="TIER_2">TIER_2</option>
                <option value="TIER_3">TIER_3</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Hardware Accessories">Hardware Accessories</option>
                <option value="Software Subscriptions">Software Subscriptions</option>
                <option value="Services">Services</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Table / List View */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
              Loading discount policy rules...
            </div>
          ) : isError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load discount policy rules: {(error as any)?.message}</span>
            </div>
          ) : policies.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-slate-200 space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No Policy Rules Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No policy rules match your query. Create a new governance rule to set discount limits and margin thresholds.
              </p>
              <Button onClick={handleCreateNew} variant="primary" size="sm">
                Create First Policy Rule
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Policy Rule Name</th>
                    <th className="py-3 px-4">Customer Tier Scope</th>
                    <th className="py-3 px-4">Category Scope</th>
                    <th className="py-3 px-4">Max Discount</th>
                    <th className="py-3 px-4">Min Margin</th>
                    <th className="py-3 px-4">Approval Role</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {policies.map((rule: DiscountPolicyRuleDto) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{rule.name}</div>
                        {rule.description && (
                          <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{rule.description}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {rule.customerTier ? (
                          <Badge variant="purple">{rule.customerTier}</Badge>
                        ) : (
                          <span className="text-slate-400 italic">GLOBAL (All)</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {rule.category ? (
                          <Badge variant="info">{rule.category}</Badge>
                        ) : (
                          <span className="text-slate-400 italic">GLOBAL (All)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-[#714B67]">{rule.maxDiscountPercent}%</td>

                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {rule.minMarginPercent !== null && rule.minMarginPercent !== undefined
                          ? `${rule.minMarginPercent}%`
                          : 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="warning">{rule.requiredApprovalRole}</Badge>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold">{rule.priority}</td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className="cursor-pointer"
                        >
                          {rule.isActive ? (
                            <Badge variant="success">ACTIVE</Badge>
                          ) : (
                            <Badge variant="default">INACTIVE</Badge>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="p-1.5 text-slate-500 hover:text-[#714B67] hover:bg-[#F3E9F1] rounded transition-colors"
                            title="Edit Policy Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Policy Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interactive Deal Simulator */}
      {activeTab === 'simulator' && <PolicySimulatorSection />}

      {/* Modal */}
      <DiscountPolicyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleToEdit={editingRule}
      />
    </div>
  );
};
