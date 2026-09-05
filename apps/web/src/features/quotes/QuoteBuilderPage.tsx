import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import {
  FileText,
  Building2,
  Package,
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  Percent,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save,
  Loader2,
} from 'lucide-react';

interface CustomerOption {
  id: string;
  code: string;
  name: string;
  tier: string;
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  category: string;
  listPrice: number;
  standardCost: number;
}

interface DraftLine {
  productId: string;
  productName: string;
  sku: string;
  listPrice: number;
  standardCost: number;
  quantity: number;
  proposedDiscountPercent: number;
}

export const QuoteBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [quoteNumber, setQuoteNumber] = useState<string>(
    `QT-${Date.now().toString().slice(-6)}`,
  );
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMasterData() {
      try {
        setIsLoading(true);
        const [custRes, prodRes] = await Promise.all([
          api.get<{ success: boolean; data: { items: CustomerOption[] } }>('/customers'),
          api.get<{ success: boolean; data: ProductOption[] }>('/products').catch(() => ({
            data: {
              success: true,
              data: [
                {
                  id: 'prod-001',
                  sku: 'PROD-001',
                  name: 'Enterprise ERP Subscription',
                  category: 'Software',
                  listPrice: 5000,
                  standardCost: 2000,
                },
                {
                  id: 'prod-002',
                  sku: 'PROD-002',
                  name: 'Implementation Consulting Services',
                  category: 'Services',
                  listPrice: 12000,
                  standardCost: 6000,
                },
                {
                  id: 'prod-003',
                  sku: 'PROD-003',
                  name: '24/7 Premium Support Add-on',
                  category: 'Support',
                  listPrice: 2500,
                  standardCost: 800,
                },
              ],
            },
          })),
        ]);

        if (custRes.data.success && custRes.data.data?.items) {
          setCustomers(custRes.data.data.items);
          if (custRes.data.data.items.length > 0) {
            setSelectedCustomerId(custRes.data.data.items[0].id);
          }
        }

        const rawProdItems =
          (prodRes.data as any)?.data?.items ||
          (Array.isArray((prodRes.data as any)?.data) ? (prodRes.data as any).data : []);

        if (Array.isArray(rawProdItems)) {
          const mappedProducts: ProductOption[] = rawProdItems.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: typeof p.category === 'string' ? p.category : p.category?.name || 'General',
            listPrice: p.unitPrice ?? p.listPrice ?? 0,
            standardCost: p.costPrice ?? p.standardCost ?? 0,
          }));

          setProducts(mappedProducts);
          if (mappedProducts.length > 0) {
            setSelectedProductId(mappedProducts[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load builder options:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMasterData();
  }, []);

  const handleAddLine = () => {
    if (!selectedProductId) return;

    const p = products.find((prod) => prod.id === selectedProductId);
    if (!p) return;

    const existingIndex = lines.findIndex((l) => l.productId === p.id);
    if (existingIndex !== -1) {
      const updated = [...lines];
      updated[existingIndex].quantity += 1;
      setLines(updated);
    } else {
      setLines([
        ...lines,
        {
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          listPrice: p.listPrice,
          standardCost: p.standardCost,
          quantity: 1,
          proposedDiscountPercent: 0,
        },
      ]);
    }
  };

  const handleUpdateLine = (
    index: number,
    field: 'quantity' | 'proposedDiscountPercent',
    val: number,
  ) => {
    const updated = [...lines];
    updated[index][field] = Math.max(0, val);
    setLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  // Instant local calculations
  let subtotal = 0;
  let totalDiscount = 0;
  let netValue = 0;
  let totalCost = 0;

  for (const line of lines) {
    const listTotal = line.listPrice * line.quantity;
    const discAmt = (listTotal * line.proposedDiscountPercent) / 100;
    const netLine = listTotal - discAmt;
    const costLine = line.standardCost * line.quantity;

    subtotal += listTotal;
    totalDiscount += discAmt;
    netValue += netLine;
    totalCost += costLine;
  }

  const grossMarginPercent =
    netValue > 0 ? Math.round(((netValue - totalCost) / netValue) * 10000) / 100 : 0;
  const avgDiscountPercent = subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0;

  let riskScore = 1.0;
  if (avgDiscountPercent > 20) riskScore += 4.0;
  else if (avgDiscountPercent > 10) riskScore += 2.0;

  if (grossMarginPercent < 20) riskScore += 5.0;
  else if (grossMarginPercent < 30) riskScore += 2.5;

  let riskLevel = 'LOW';
  if (riskScore >= 7.0) riskLevel = 'HIGH';
  else if (riskScore >= 4.0) riskLevel = 'MEDIUM';

  const handleCreateQuote = async () => {
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        customerId: selectedCustomerId,
        quoteNumber,
        initialLines: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          proposedDiscountPercent: l.proposedDiscountPercent,
        })),
      };

      const res = await api.post<{ success: boolean; data: { id: string } }>(
        '/quotes',
        payload,
      );

      if (res.data.success) {
        navigate(`/quotations/${res.data.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create quotation:', err);
      setError(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#714B67]" />
              New Commercial Quotation
            </h1>
            <p className="text-xs text-slate-500">
              Build sales quote with instant margin calculation and commercial policy checks
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateQuote}
          disabled={isSaving || lines.length === 0}
          className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Quotation
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Primary Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" /> Select Customer
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#714B67]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code}) - {c.tier} Tier
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Quotation Reference Number
          </label>
          <input
            type="text"
            value={quoteNumber}
            onChange={(e) => setQuoteNumber(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Subtotal
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            ${subtotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Total Discount
          </span>
          <p className="text-xl font-bold text-amber-700 font-mono mt-1">
            ${totalDiscount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Net Value
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            ${netValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Projected Margin
          </span>
          <p className="text-xl font-bold text-purple-700 font-mono mt-1">
            {grossMarginPercent}%
          </p>
        </div>
      </div>

      {/* Line Item Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" /> Quote Line Items ({lines.length})
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#714B67]"
            >
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.listPrice})
                </option>
              ))}
            </select>

            <button
              onClick={handleAddLine}
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No lines added yet. Select a product above to start building the quotation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">List Price</th>
                  <th className="py-2.5 px-3 text-right">Disc %</th>
                  <th className="py-2.5 px-3 text-right">Net Line</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {lines.map((line, idx) => {
                  const listTotal = line.listPrice * line.quantity;
                  const discAmt = (listTotal * line.proposedDiscountPercent) / 100;
                  const netLine = listTotal - discAmt;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-900">{line.productName}</div>
                        <div className="text-[11px] text-slate-400">SKU: {line.sku}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) =>
                            handleUpdateLine(idx, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:border-[#714B67]"
                        />
                      </td>

                      <td className="py-3 px-3 text-right text-slate-700">
                        ${line.listPrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.proposedDiscountPercent}
                          onChange={(e) =>
                            handleUpdateLine(
                              idx,
                              'proposedDiscountPercent',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-16 text-right border border-slate-200 rounded px-2 py-1 bg-slate-50 text-amber-700 font-bold focus:border-[#714B67]"
                        />
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ${netLine.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
