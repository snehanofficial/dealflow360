import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Home,
  Plus,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Boxes,
  MapPin,
  ListOrdered,
} from 'lucide-react';

interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  location: string;
  priority: number;
  isActive: boolean;
  inventory?: Array<{
    id: string;
    onHandQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    product: { name: string; sku: string };
  }>;
}

export const WarehouseManagementPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<WarehouseItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    location: '',
    priority: 10,
    isActive: true,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const openCreateModal = () => {
    setEditingWh(null);
    setFormData({ code: '', name: '', description: '', location: '', priority: 10, isActive: true });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (wh: WarehouseItem) => {
    setEditingWh(wh);
    setFormData({
      code: wh.code,
      name: wh.name,
      description: wh.description || '',
      location: wh.location,
      priority: wh.priority || 10,
      isActive: wh.isActive,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingWh) {
        await api.patch(`/warehouses/${editingWh.id}`, formData);
      } else {
        await api.post('/warehouses', formData);
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to save warehouse');
    } finally {
      setSaving(false);
    }
  };

  const filtered = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-lg">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Warehouse Master Data</h1>
            <p className="text-xs text-slate-500">Configure fulfillment centers, operational priorities & status</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchWarehouses}
            className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5c3d54] rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search warehouse by name, code, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#714B67] mb-2" />
          <p className="text-xs">Loading warehouses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((wh) => {
            const totalStock = wh.inventory?.reduce((sum, i) => sum + i.onHandQuantity, 0) || 0;
            const totalAvailable = wh.inventory?.reduce((sum, i) => sum + i.availableQuantity, 0) || 0;

            return (
              <div key={wh.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {wh.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{wh.name}</h3>
                  </div>
                  <Badge variant={wh.isActive ? 'success' : 'default'}>
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>Location: {wh.location}</span>
                  </div>
                  <div className="flex items-center">
                    <ListOrdered className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>Priority Ranking: <strong className="text-slate-900">Priority {wh.priority}</strong></span>
                  </div>
                </div>

                {/* Stock Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">On-Hand Stock</span>
                    <span className="font-bold text-slate-800">{totalStock} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Available Stock</span>
                    <span className="font-bold text-green-700">{totalAvailable} units</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => openEditModal(wh)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#714B67] hover:bg-[#714B67]/5 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit Settings
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingWh ? `Edit Warehouse — ${editingWh.code}` : 'Create New Warehouse'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingWh}
                  placeholder="e.g. WH-SOUTH"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Logistics Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US-South, Austin TX"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority Hierarchy (1 = Highest)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 10 })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#714B67] focus:ring-[#714B67]"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
                  Warehouse Active for Auto-Allocation
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5c3d54] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
