import React, { useState } from 'react';
import { Play, Plus, Trash2, ShieldCheck, ShieldAlert, Layers, DollarSign, Percent } from 'lucide-react';
import { useProducts } from '../products/useProducts.js';
import { useEvaluateCommercialScenario } from './useDiscountPolicies.js';
import { CommercialEvaluationDto, EvaluationLineInput } from '@dealflow360/contracts';
import { Alert, Badge, Button, Card, CardBody } from '../../components/ui/index.js';

export const PolicySimulatorSection: React.FC = () => {
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  const evaluateMutation = useEvaluateCommercialScenario();

  const [customerTier, setCustomerTier] = useState<string>('ENTERPRISE');
  const [currency, setCurrency] = useState<string>('USD');
  const [lines, setLines] = useState<EvaluationLineInput[]>([
    {
      productId: '',
      quantity: 1,
      proposedDiscountPercent: 10,
    },
  ]);
  const [evaluationResult, setEvaluationResult] = useState<CommercialEvaluationDto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const products = productsData?.items || [];

  // Populate first product if available and none selected
  React.useEffect(() => {
    if (products.length > 0 && lines.length === 1 && !lines[0].productId) {
      setLines([{ ...lines[0], productId: products[0].id }]);
    }
  }, [products]);

  const handleAddLine = () => {
    const defaultProduct = products.length > 0 ? products[0].id : '';
    setLines([...lines, { productId: defaultProduct, quantity: 1, proposedDiscountPercent: 5 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof EvaluationLineInput, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleEvaluate = async () => {
    setErrorMsg(null);

    const validLines = lines.filter((l) => !!l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setErrorMsg('Please select at least one valid product line.');
      return;
    }

    try {
      const result = await evaluateMutation.mutateAsync({
        customerTier: customerTier as any,
        currency,
        lines: validLines,
      });
      setEvaluationResult(result || null);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to evaluate commercial scenario.');
    }
  };

  const getRiskBadgeVariant = (level: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (level) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
      case 'CRITICAL':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Play className="w-5 h-5 text-[#714B67] fill-[#714B67]" />
              <span>Commercial Deal Simulator & Evaluator</span>
            </h2>
            <p className="text-xs text-slate-500">
              Simulate commercial deal line scenarios against live discount policy rules & effective pricing
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Customer Tier
              </label>
              <select
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="ENTERPRISE">ENTERPRISE</option>
                <option value="GOLD">GOLD</option>
                <option value="SILVER">SILVER</option>
                <option value="BRONZE">BRONZE</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {errorMsg && (
          <Alert type="danger">
            {errorMsg}
          </Alert>
        )}

        {/* Deal Line Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Deal Line Items ({lines.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLine}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Product Line
            </Button>
          </div>

          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-5">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Product</label>
                  <select
                    value={line.productId}
                    onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#714B67]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - Base ${p.unitPrice} (Cost ${p.costPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Proposed Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={line.proposedDiscountPercent}
                      onChange={(e) => handleLineChange(idx, 'proposedDiscountPercent', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 pr-6 outline-none focus:ring-1 focus:ring-[#714B67]"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length === 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleEvaluate}
              isLoading={evaluateMutation.isPending}
            >
              <Play className="w-4 h-4 mr-1.5 fill-white" />
              <span>Run Commercial Evaluation</span>
            </Button>
          </div>
        </div>

        {/* Evaluation Results Output */}
        {evaluationResult && (
          <div className="mt-6 border-t border-slate-200 pt-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-[#5F3D56] bg-[#714B67] text-white shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  {evaluationResult.violations.length === 0 ? (
                    <Badge variant="success" size="md">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      GOVERNANCE PASS
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="md">
                      <ShieldAlert className="w-4 h-4 mr-1" />
                      GOVERNANCE VIOLATION ({evaluationResult.violations.length})
                    </Badge>
                  )}

                  <Badge variant={getRiskBadgeVariant(evaluationResult.riskLevel)} size="md">
                    RISK {evaluationResult.riskLevel} · {evaluationResult.riskScore}
                  </Badge>
                </div>
                <p className="text-xs text-purple-100/90 pt-1">
                  Evaluated server-side at {new Date(evaluationResult.evaluatedAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-white/20 pt-3 sm:pt-0 sm:pl-6 text-right">
                <div>
                  <div className="text-[10px] text-purple-200 font-semibold uppercase">Net Deal Value</div>
                  <div className="text-lg font-bold text-emerald-300">${evaluationResult.netTotal.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-purple-200 font-semibold uppercase">Gross Margin</div>
                  <div className="text-lg font-bold text-white">
                    ${evaluationResult.marginAmount.toLocaleString()} ({evaluationResult.marginPercentage}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Required Approval Roles Banner */}
            {evaluationResult.requiresApproval && (
              <Alert type="warning" title="Required Approval Routing">
                <p className="mt-0.5">
                  Commercial terms trigger mandatory workflow approval before quotation can be finalized.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {evaluationResult.requiredApprovalRoles.map((role) => (
                    <Badge key={role} variant="warning" size="sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              </Alert>
            )}

            {/* Policy Violations Explanations */}
            {evaluationResult.violations.length > 0 && (
              <Alert type="danger" title="Explainable Policy Violations">
                <div className="space-y-2 mt-2">
                  {evaluationResult.violations.map((violation, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-md border border-red-200/60 text-xs text-slate-800 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-red-800 font-medium">{violation.ruleName}</span>
                        <Badge variant="danger" size="sm">
                          {violation.severity}
                        </Badge>
                      </div>
                      <p className="text-slate-600">{violation.message}</p>
                      <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                        Allowed: {violation.allowedValue}% | Proposed: {violation.proposedValue}%
                      </div>
                    </div>
                  ))}
                </div>
              </Alert>
            )}

            {/* Detailed Line Evaluation Table */}
            {evaluationResult.lineEvaluations && (
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Line-by-Line Commercial Breakdown
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Product / SKU</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Effective Price</th>
                        <th className="py-2.5 px-3">Discount</th>
                        <th className="py-2.5 px-3">Net Line Total</th>
                        <th className="py-2.5 px-3">Unit Cost</th>
                        <th className="py-2.5 px-3">Gross Margin</th>
                        <th className="py-2.5 px-3">Policy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {evaluationResult.lineEvaluations.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            <div>{line.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{line.sku}</div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold">{line.quantity}</td>
                          <td className="py-2.5 px-3 font-mono">${line.effectiveUnitPrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-[#714B67]">{line.proposedDiscountPercent}%</span>
                            <div className="text-[10px] text-slate-400">(-${line.discountAmount})</div>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">${line.netLineTotal.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">${line.unitCost.toLocaleString()}</td>
                          <td className="py-2.5 px-3">
                            <span className={`font-semibold ${line.marginPercentage >= 25 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {line.marginPercentage}%
                            </span>
                            <div className="text-[10px] text-slate-400">(${line.marginAmount})</div>
                          </td>
                          <td className="py-2.5 px-3">
                            {line.violations.length === 0 ? (
                              <Badge variant="success" size="sm">OK</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">{line.violations.length} VIOLATION</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

