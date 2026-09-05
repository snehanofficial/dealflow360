import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Boxes,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  Send,
} from 'lucide-react';

interface BackorderItem {
  id: string;
  quotationId: string;
  quotation: { quoteNumber: string; customer: { name: string; tier: string } };
  productId: string;
  product: { name: string; sku: string };
  requestedQuantity: number;
  allocatedQuantity: number;
  backorderedQuantity: number;
  status: string;
  createdAt: string;
  totalAvailableStock: number;
  canReallocate: boolean;
  stockAvailability: Array<{
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    availableQuantity: number;
  }>;
}

export const BackordersPage: React.FC = () => {
  const [backorders, setBackorders] = useState<BackorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBackorder, setSelectedBackorder] = useState<BackorderItem | null>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [reallocateQty, setReallocateQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBackorders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fulfillment/backorders');
      setBackorders(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load backorders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackorders();
  }, []);

  const openReallocateDrawer = async (item: BackorderItem) => {
    setSelectedBackorder(item);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingProposal(true);
    try {
      const res = await api.get(`/fulfillment/backorders/${item.id}/propose`);
      const proposal = res.data?.data || res.data;
      setProposalData(proposal);
      if (proposal.proposals && proposal.proposals.length > 0) {
        setSelectedWarehouseId(proposal.proposals[0].warehouseId);
        setReallocateQty(proposal.proposals[0].maxReallocateQuantity);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to fetch reallocation proposal');
    } finally {
      setLoadingProposal(false);
    }
  };

  const handleConfirmReallocation = async () => {
    if (!selectedBackorder || !selectedWarehouseId) return;
    setConfirming(true);
    setErrorMsg(null);
    try {
      await api.post(`/fulfillment/backorders/${selectedBackorder.id}/reallocate`, {
        warehouseId: selectedWarehouseId,
        reallocateQuantity: Number(reallocateQty),
        notes,
      });
      setSuccessMsg('Backorder reallocation confirmed & stock reserved successfully!');
      fetchBackorders();
      setTimeout(() => setSelectedBackorder(null), 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to confirm reallocation');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = backorders.filter(
    (b) =>
      b.quotation?.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.quotation?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Backorder Queue & Re-Evaluation</h1>
            <p className="text-xs text-slate-500">Track outstanding fulfillment deficits & execute controlled stock reallocation proposals</p>
          </div>
        </div>

        <button
          onClick={fetchBackorders}
          className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          Refresh Queue
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search backorders by quote number, customer, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* Backorders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#714B67] mb-2" />
            Loading backorders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs italic">No outstanding backorders found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Quotation / Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4 text-right">Requested</th>
                <th className="p-4 text-right">Allocated</th>
                <th className="p-4 text-right">Backordered</th>
                <th className="p-4 text-center">Stock Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#714B67]">{item.quotation?.quoteNumber}</div>
                    <div className="text-[10px] text-slate-500">{item.quotation?.customer?.name}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    <div>{item.product?.name}</div>
                    <div className="text-[10px] text-slate-400">SKU: {item.product?.sku}</div>
                  </td>
                  <td className="p-4 text-right font-semibold text-slate-800">{item.requestedQuantity}</td>
                  <td className="p-4 text-right font-semibold text-slate-700">{item.allocatedQuantity}</td>
                  <td className="p-4 text-right font-bold text-amber-700">{item.backorderedQuantity}</td>
                  <td className="p-4 text-center">
                    <Badge variant={item.canReallocate ? 'success' : 'warning'} size="sm">
                      {item.canReallocate ? `Stock Available (${item.totalAvailableStock})` : 'Stock Deficit'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openReallocateDrawer(item)}
                      disabled={!item.canReallocate}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5c3d54] rounded-md transition-colors shadow-sm disabled:opacity-40"
                    >
                      Re-Evaluate Allocation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reallocation Proposal Modal */}
      {selectedBackorder && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Backorder Reallocation Proposal
                </h3>
                <p className="text-xs text-slate-500">Quote: {selectedBackorder.quotation?.quoteNumber}</p>
              </div>
              <button onClick={() => setSelectedBackorder(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {successMsg}
                </div>
              )}

              {loadingProposal ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#714B67] mb-2" />
                  Calculating allocation proposal...
                </div>
              ) : proposalData ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Product:</span>
                      <span className="font-bold text-slate-800">{selectedBackorder.product?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Outstanding Backorder Qty:</span>
                      <span className="font-bold text-amber-700">{selectedBackorder.backorderedQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Proposed Reallocation:</span>
                      <span className="font-bold text-green-700">{proposalData.totalProposedQuantity} units</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Source Warehouse</label>
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => {
                        setSelectedWarehouseId(e.target.value);
                        const match = proposalData.proposals?.find((p: any) => p.warehouseId === e.target.value);
                        if (match) setReallocateQty(match.maxReallocateQuantity);
                      }}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                    >
                      {proposalData.proposals?.map((p: any) => (
                        <option key={p.warehouseId} value={p.warehouseId}>
                          {p.warehouseName} ({p.warehouseCode}) — Max Allocable: {p.maxReallocateQuantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity to Reallocate & Reserve</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={reallocateQty}
                      onChange={(e) => setReallocateQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Audit Notes / Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Replenishment PO arrived"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                    />
                  </div>
                </div>
              ) : null}

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedBackorder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReallocation}
                  disabled={confirming || !selectedWarehouseId}
                  className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5c3d54] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {confirming ? 'Confirming...' : 'Authorize Reallocation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
