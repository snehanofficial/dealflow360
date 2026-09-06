import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Package,
  Boxes,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  Plus,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface InventoryStockItem {
  id: string;
  warehouseId: string;
  warehouse: { code: string; name: string };
  productId: string;
  product: { name: string; sku: string; listPrice: number };
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

interface InventoryMovement {
  id: string;
  movementType: string;
  quantity: number;
  onHandBefore: number;
  onHandAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  reason?: string;
  actorName?: string;
  createdAt: string;
  warehouse: { name: string; code: string };
  product: { name: string; sku: string };
}

export const InventoryDashboardPage: React.FC = () => {
  const [stockItems, setStockItems] = useState<InventoryStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  const [adjustmentData, setAdjustmentData] = useState({
    warehouseId: '',
    productId: '',
    quantity: 10,
    movementType: 'RECEIPT',
    reason: 'Stock replenishment receipt',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setStockItems(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load inventory stock', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get('/inventory/movements');
      setMovements(res.data?.data || res.data || []);
      setIsMovementModalOpen(true);
    } catch (err) {
      console.error('Failed to load movement ledger', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const warehouseId = adjustmentData.warehouseId || stockItems[0]?.warehouseId;
      const productId = adjustmentData.productId || stockItems[0]?.productId;

      if (!warehouseId || !productId) {
        setErrorMsg('Please select a target stock item.');
        setSaving(false);
        return;
      }

      const payload = {
        ...adjustmentData,
        warehouseId,
        productId,
      };

      await api.post('/inventory/adjustments', payload);
      setIsAdjustmentModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to adjust inventory');
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalOnHand = stockItems.reduce((sum, i) => sum + i.onHandQuantity, 0);
  const totalReserved = stockItems.reduce((sum, i) => sum + i.reservedQuantity, 0);
  const totalAvailable = stockItems.reduce((sum, i) => sum + (i.onHandQuantity - i.reservedQuantity), 0);

  const productAvailableMap = new Map<string, number>();
  for (const item of stockItems) {
    const current = productAvailableMap.get(item.productId) || 0;
    const avail = Math.max(0, item.onHandQuantity - item.reservedQuantity);
    productAvailableMap.set(item.productId, current + avail);
  }
  const lowStockCount = Array.from(productAvailableMap.values()).filter((avail) => avail < 10).length;

  const filtered = stockItems.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Stock Ledger</h1>
            <p className="text-xs text-slate-500">Real-time stock accounting, reservations & audited inventory movement ledger</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMovements}
            className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Movement Ledger
          </button>

          <button
            onClick={() => {
              if (stockItems.length > 0) {
                setAdjustmentData({
                  warehouseId: stockItems[0].warehouseId,
                  productId: stockItems[0].productId,
                  quantity: 10,
                  movementType: 'RECEIPT',
                  reason: 'Stock replenishment receipt',
                });
              }
              setIsAdjustmentModalOpen(true);
            }}
            className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5c3d54] rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Stock Receipt / Adjustment
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>TOTAL ON-HAND STOCK</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalOnHand} <span className="text-xs font-normal text-slate-400">units</span></p>
          <span className="text-[10px] text-slate-400">Physical stock in warehouses</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>RESERVED QUANTITY</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{totalReserved} <span className="text-xs font-normal text-amber-500">units</span></p>
          <span className="text-[10px] text-amber-600">Reserved for approved orders</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>DERIVED AVAILABLE STOCK</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700">{totalAvailable} <span className="text-xs font-normal text-green-500">units</span></p>
          <span className="text-[10px] text-green-600">onHand - reserved invariant</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>LOW STOCK ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{lowStockCount} <span className="text-xs font-normal text-red-400">SKUs</span></p>
          <span className="text-[10px] text-red-500">Available stock &lt; 10 units</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock by product name, SKU, warehouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#714B67] mb-2" />
            Loading inventory stock data...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Product / SKU</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4 text-right">On-Hand</th>
                <th className="p-4 text-right">Reserved</th>
                <th className="p-4 text-right">Available (onHand - reserved)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((item) => {
                const available = Math.max(0, item.onHandQuantity - item.reservedQuantity);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      <div>{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">SKU: {item.product.sku}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      <span className="font-semibold text-slate-800">{item.warehouse.name}</span>
                      <span className="text-[10px] text-slate-400 block">{item.warehouse.code}</span>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-800">{item.onHandQuantity}</td>
                    <td className="p-4 text-right font-semibold text-amber-700">{item.reservedQuantity}</td>
                    <td className="p-4 text-right font-bold text-green-700">{available}</td>
                    <td className="p-4 text-center">
                      <Badge variant={available === 0 ? 'danger' : available < 10 ? 'warning' : 'success'} size="sm">
                        {available === 0 ? 'OUT OF STOCK' : available < 10 ? 'LOW STOCK' : 'IN STOCK'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setAdjustmentData({
                            warehouseId: item.warehouseId,
                            productId: item.productId,
                            quantity: 10,
                            movementType: 'RECEIPT',
                            reason: `Stock adjustment for ${item.product.sku}`,
                          });
                          setIsAdjustmentModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#714B67] bg-[#714B67]/10 hover:bg-[#714B67]/20 rounded transition-colors inline-flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Movement History Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <History className="w-4 h-4 mr-2 text-[#714B67]" />
                Audited Inventory Movement Ledger
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {movements.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No inventory movements recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{m.product?.name}</span>
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">{m.movementType}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Warehouse: {m.warehouse?.name} | {new Date(m.createdAt).toLocaleString()}
                        </p>
                        {m.reason && <p className="text-[10px] text-slate-400 italic">Reason: {m.reason}</p>}
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm block">Qty: {m.quantity}</span>
                        <span className="text-[10px] text-slate-500 block">
                          On-Hand: {m.onHandBefore} → {m.onHandAfter} | Reserved: {m.reservedBefore} → {m.reservedAfter}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Stock Receipt / Adjustment</h3>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Stock Item</label>
                <select
                  value={
                    adjustmentData.warehouseId && adjustmentData.productId
                      ? `${adjustmentData.warehouseId}::${adjustmentData.productId}`
                      : stockItems[0]
                        ? `${stockItems[0].warehouseId}::${stockItems[0].productId}`
                        : ''
                  }
                  onChange={(e) => {
                    const [whId, prodId] = e.target.value.split('::');
                    setAdjustmentData({ ...adjustmentData, warehouseId: whId, productId: prodId });
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={`${item.warehouseId}::${item.productId}`}>
                      {item.product.name} ({item.warehouse.code}) - On-Hand: {item.onHandQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Movement Type</label>
                <select
                  value={adjustmentData.movementType}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, movementType: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                >
                  <option value="RECEIPT">RECEIPT (Add inbound stock)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Manual count adjustment)</option>
                  <option value="RETURN">RETURN (Customer return receipt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PO-89412 Supplier Delivery"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5c3d54] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Processing...' : 'Record Stock Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
