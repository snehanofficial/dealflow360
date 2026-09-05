import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import {
  Truck,
  Building2,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
  RotateCcw,
  Loader2,
  Layers,
} from 'lucide-react';

interface WarehouseStock {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  productId: string;
  availableQuantity: number;
}

interface LineAllocation {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  allocatedQuantity: number;
}

interface LineFulfillmentResult {
  quoteLineId: string;
  productId: string;
  requestedQuantity: number;
  totalAllocated: number;
  backorderedQuantity: number;
  isFullyFulfilled: boolean;
  allocations: LineAllocation[];
}

interface OverallFulfillmentResult {
  lineResults: LineFulfillmentResult[];
  totalRequested: number;
  totalAllocated: number;
  totalBackordered: number;
  shipmentCount: number;
  isFullyFulfilled: boolean;
}

interface FulfillmentPlanData {
  quotation: {
    id: string;
    quoteNumber: string;
    status: string;
    customer: { name: string; tier: string };
    lines: {
      id: string;
      productId: string;
      quantity: number;
      product: { name: string; sku: string };
    }[];
  };
  computedPlan: OverallFulfillmentResult;
  availableStock: WarehouseStock[];
}

export const FulfillmentAllocationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [planData, setPlanData] = useState<FulfillmentPlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable overrides map: `lineId_warehouseId` -> allocatedQuantity
  const [manualAllocations, setManualAllocations] = useState<Record<string, number>>({});

  const quoteId = id || 'quote-sample-001';

  const fetchFulfillmentPlan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: FulfillmentPlanData }>(
        `/quotes/${quoteId}/fulfillment`,
      );

      if (res.data.success) {
        setPlanData(res.data.data);
        // Pre-fill manual allocations with computed plan
        const initialMap: Record<string, number> = {};
        for (const lr of res.data.data.computedPlan.lineResults) {
          for (const alloc of lr.allocations) {
            initialMap[`${lr.quoteLineId}_${alloc.warehouseId}`] = alloc.allocatedQuantity;
          }
        }
        setManualAllocations(initialMap);
      }
    } catch (err: any) {
      console.error('Failed to load fulfillment plan:', err);
      setError(err.response?.data?.message || 'Failed to load fulfillment plan');
    } finally {
      setIsLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    fetchFulfillmentPlan();
  }, [fetchFulfillmentPlan]);

  const handleAllocationChange = (lineId: string, warehouseId: string, val: number) => {
    setManualAllocations((prev) => ({
      ...prev,
      [`${lineId}_${warehouseId}`]: Math.max(0, val),
    }));
  };

  const handleSavePlan = async () => {
    if (!planData) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);

      const overridesList: { quoteLineId: string; warehouseId: string; allocatedQuantity: number }[] = [];

      for (const [key, qty] of Object.entries(manualAllocations)) {
        if (qty > 0) {
          const [quoteLineId, warehouseId] = key.split('_');
          overridesList.push({ quoteLineId, warehouseId, allocatedQuantity: qty });
        }
      }

      const res = await api.post<{ success: boolean; message: string }>(
        `/quotes/${quoteId}/fulfillment/override`,
        { overrides: overridesList },
      );

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        await fetchFulfillmentPlan();
      }
    } catch (err: any) {
      console.error('Failed to save fulfillment plan:', err);
      setError(err.response?.data?.message || 'Failed to save fulfillment plan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-sm font-medium text-slate-600">Computing Multi-Warehouse Fulfillment...</p>
        </div>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="font-semibold text-lg">Fulfillment Data Unavailable</h3>
          <p className="text-sm">{error || 'Unable to load quotation fulfillment details.'}</p>
        </div>
        <button
          onClick={() => navigate('/quotations')}
          className="inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Quotation List
        </button>
      </div>
    );
  }

  const { quotation, computedPlan, availableStock } = planData;
  // Get unique warehouses from available stock
  const warehouses = Array.from(
    new Map(availableStock.map((s) => [s.warehouseId, { id: s.warehouseId, code: s.warehouseCode, name: s.warehouseName }])).values(),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/quotations/${quotation.id}`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#714B67]" />
                Multi-Warehouse Fulfillment Allocation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Quote #{quotation.quoteNumber} • {quotation.customer?.name || 'Customer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFulfillmentPlan}
            className="inline-flex items-center gap-1.5 p-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Recommended
          </button>

          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-xs"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Confirm Fulfillment Plan
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Requested Units
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {computedPlan.totalRequested}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Total Allocated
          </span>
          <p className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {computedPlan.totalAllocated}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Backordered Units
          </span>
          <p className="text-xl font-bold text-rose-700 font-mono mt-1">
            {computedPlan.totalBackordered}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-600" /> Active Shipments
          </span>
          <p className="text-xl font-bold text-purple-700 font-mono mt-1">
            {computedPlan.shipmentCount} Warehouse(s)
          </p>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-600" /> Multi-Warehouse Stock Split & Override Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Line Product</th>
                <th className="py-3 px-3 text-center">Req Qty</th>
                {warehouses.map((wh) => (
                  <th key={wh.id} className="py-3 px-4 text-center">
                    {wh.code}
                    <div className="text-[10px] text-slate-400 font-normal">{wh.name}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center">Backorder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {quotation.lines.map((line) => {
                const lr = computedPlan.lineResults.find((r) => r.quoteLineId === line.id);
                let currentAllocSum = 0;

                for (const wh of warehouses) {
                  currentAllocSum += manualAllocations[`${line.id}_${wh.id}`] || 0;
                }

                const backorder = Math.max(0, line.quantity - currentAllocSum);

                return (
                  <tr key={line.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{line.product?.name || 'Product'}</div>
                      <div className="text-[11px] text-slate-400">SKU: {line.product?.sku || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-sans">
                      {line.quantity}
                    </td>

                    {warehouses.map((wh) => {
                      const stock = availableStock.find(
                        (s) => s.productId === line.productId && s.warehouseId === wh.id,
                      );
                      const avail = stock ? stock.availableQuantity : 0;
                      const currentVal = manualAllocations[`${line.id}_${wh.id}`] || 0;

                      return (
                        <td key={wh.id} className="py-3.5 px-4 text-center">
                          <div className="space-y-1">
                            <input
                              type="number"
                              min="0"
                              max={avail}
                              value={currentVal}
                              onChange={(e) =>
                                handleAllocationChange(
                                  line.id,
                                  wh.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-16 text-center border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:border-[#714B67]"
                            />
                            <div className="text-[10px] text-slate-400 font-sans">
                              (Stock: {avail})
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 font-sans">
                      {backorder > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
                          {backorder}
                        </span>
                      ) : (
                        <span className="text-emerald-600">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
