export interface QuotationSummaryInput {
  id: string;
  quoteNumber: string;
  status: string;
  netValue: number;
  grossMarginPercent: number;
  riskScore: number;
  riskLevel: string;
  updatedAt: Date;
  customerName?: string;
  linesCount?: number;
  hasBackorders?: boolean;
}

export interface DetectedAlert {
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  alertType: 'STALLED_DEAL' | 'MARGIN_LEAKAGE' | 'FULFILLMENT_RISK' | 'HIGH_RISK';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
}

export interface ControlTowerMetricsResult {
  totalPipelineValue: number;
  activeQuoteCount: number;
  stalledDealsCount: number;
  marginLeakageCount: number;
  fulfillmentRiskCount: number;
  highRiskDealsCount: number;
  averageGrossMarginPercent: number;
}

/**
 * Identifies stalled deals in the commercial pipeline.
 * A deal is stalled if it remains in a pending state without updates for > stalledDaysThreshold days.
 */
export function detectStalledDeals(
  quotations: QuotationSummaryInput[],
  stalledDaysThreshold: number = 7,
  referenceDate: Date = new Date(),
): DetectedAlert[] {
  const alerts: DetectedAlert[] = [];
  const pendingStatuses = ['DRAFT', 'PENDING_MANAGER', 'PENDING_FINANCE', 'NEGOTIATING'];

  for (const q of quotations) {
    if (!pendingStatuses.includes(q.status)) continue;

    const diffTime = referenceDate.getTime() - new Date(q.updatedAt).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays >= stalledDaysThreshold) {
      alerts.push({
        quotationId: q.id,
        quoteNumber: q.quoteNumber,
        customerName: q.customerName || 'Customer',
        alertType: 'STALLED_DEAL',
        severity: diffDays >= 14 ? 'CRITICAL' : 'WARNING',
        message: `Quote #${q.quoteNumber} has been inactive for ${diffDays} days in state ${q.status}.`,
      });
    }
  }

  return alerts;
}

/**
 * Identifies quotes suffering from margin leakage below governed threshold.
 */
export function detectMarginLeakage(
  quotations: QuotationSummaryInput[],
  minMarginThreshold: number = 25.0,
): DetectedAlert[] {
  const alerts: DetectedAlert[] = [];

  for (const q of quotations) {
    if (q.netValue <= 0) continue;

    if (q.grossMarginPercent < minMarginThreshold) {
      alerts.push({
        quotationId: q.id,
        quoteNumber: q.quoteNumber,
        customerName: q.customerName || 'Customer',
        alertType: 'MARGIN_LEAKAGE',
        severity: q.grossMarginPercent < 15.0 ? 'CRITICAL' : 'WARNING',
        message: `Gross margin (${q.grossMarginPercent}%) is below governed threshold (${minMarginThreshold}%).`,
      });
    }
  }

  return alerts;
}

/**
 * Computes executive pipeline and operational metrics for the Control Tower.
 */
export function computeControlTowerMetrics(
  quotations: QuotationSummaryInput[],
  alerts: DetectedAlert[] = [],
): ControlTowerMetricsResult {
  let totalPipelineValue = 0;
  let totalMarginSum = 0;
  let highRiskCount = 0;
  let fulfillmentRiskCount = 0;

  for (const q of quotations) {
    totalPipelineValue += q.netValue;
    totalMarginSum += q.grossMarginPercent;

    if (q.riskLevel === 'HIGH' || q.riskLevel === 'CRITICAL' || q.riskScore >= 6.0) {
      highRiskCount++;
    }

    if (q.status === 'FULFILLMENT' && q.hasBackorders) {
      fulfillmentRiskCount++;
    }
  }

  const activeQuoteCount = quotations.length;
  const averageGrossMarginPercent =
    activeQuoteCount > 0 ? Math.round((totalMarginSum / activeQuoteCount) * 100) / 100 : 0;

  const stalledDealsCount = alerts.filter((a) => a.alertType === 'STALLED_DEAL').length;
  const marginLeakageCount = alerts.filter((a) => a.alertType === 'MARGIN_LEAKAGE').length;

  return {
    totalPipelineValue: Math.round(totalPipelineValue * 100) / 100,
    activeQuoteCount,
    stalledDealsCount,
    marginLeakageCount,
    fulfillmentRiskCount,
    highRiskDealsCount: highRiskCount,
    averageGrossMarginPercent,
  };
}
