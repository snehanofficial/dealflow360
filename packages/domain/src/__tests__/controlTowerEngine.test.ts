import { describe, it, expect } from 'vitest';
import {
  detectStalledDeals,
  detectMarginLeakage,
  computeControlTowerMetrics,
  QuotationSummaryInput,
} from '../control-tower/controlTowerEngine.js';

describe('Control Tower Domain Engine', () => {
  const referenceDate = new Date('2026-03-01T00:00:00.000Z');

  const sampleQuotes: QuotationSummaryInput[] = [
    {
      id: 'q-1',
      quoteNumber: 'QT-101',
      status: 'DRAFT',
      netValue: 15000,
      grossMarginPercent: 35.0,
      riskScore: 2.0,
      riskLevel: 'LOW',
      updatedAt: new Date('2026-02-15T00:00:00.000Z'), // 14 days ago (Stalled)
      customerName: 'Acme Corp',
    },
    {
      id: 'q-2',
      quoteNumber: 'QT-102',
      status: 'PENDING_MANAGER',
      netValue: 50000,
      grossMarginPercent: 18.0, // Below 25% threshold (Margin Leakage)
      riskScore: 7.5,
      riskLevel: 'HIGH',
      updatedAt: new Date('2026-02-28T00:00:00.000Z'), // Recent
      customerName: 'Beta Industries',
    },
    {
      id: 'q-3',
      quoteNumber: 'QT-103',
      status: 'FULFILLMENT',
      netValue: 80000,
      grossMarginPercent: 40.0,
      riskScore: 1.5,
      riskLevel: 'LOW',
      updatedAt: new Date('2026-02-27T00:00:00.000Z'),
      customerName: 'Gamma Systems',
      hasBackorders: true,
    },
  ];

  it('detects stalled deals exceeding threshold days', () => {
    const stalledAlerts = detectStalledDeals(sampleQuotes, 7, referenceDate);
    expect(stalledAlerts.length).toBe(1);
    expect(stalledAlerts[0].quoteNumber).toBe('QT-101');
    expect(stalledAlerts[0].alertType).toBe('STALLED_DEAL');
    expect(stalledAlerts[0].severity).toBe('CRITICAL');
  });

  it('detects margin leakage for quotes below minimum margin threshold', () => {
    const leakageAlerts = detectMarginLeakage(sampleQuotes, 25.0);
    expect(leakageAlerts.length).toBe(1);
    expect(leakageAlerts[0].quoteNumber).toBe('QT-102');
    expect(leakageAlerts[0].alertType).toBe('MARGIN_LEAKAGE');
  });

  it('computes aggregated control tower pipeline metrics', () => {
    const stalledAlerts = detectStalledDeals(sampleQuotes, 7, referenceDate);
    const leakageAlerts = detectMarginLeakage(sampleQuotes, 25.0);
    const allAlerts = [...stalledAlerts, ...leakageAlerts];

    const metrics = computeControlTowerMetrics(sampleQuotes, allAlerts);

    expect(metrics.totalPipelineValue).toBe(145000);
    expect(metrics.activeQuoteCount).toBe(3);
    expect(metrics.stalledDealsCount).toBe(1);
    expect(metrics.marginLeakageCount).toBe(1);
    expect(metrics.fulfillmentRiskCount).toBe(1);
    expect(metrics.highRiskDealsCount).toBe(1);
    expect(metrics.averageGrossMarginPercent).toBe(31);
  });
});
