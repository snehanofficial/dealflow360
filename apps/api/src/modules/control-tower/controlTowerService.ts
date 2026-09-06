import { db } from '@dealflow360/db';
import {
  detectStalledDeals,
  detectMarginLeakage,
  computeControlTowerMetrics,
  QuotationSummaryInput,
  DetectedAlert,
} from '@dealflow360/domain';
import { recordAuditEvent } from '../../services/auditService.js';
import { ConfigService } from '../config/configService.js';

export interface ControlTowerFilterOptions {
  status?: string;
  riskLevel?: string;
  search?: string;
}

export class ControlTowerService {
  async getControlTowerDashboardData(filters: ControlTowerFilterOptions = {}) {
    const quotations = await db.quotation.findMany({
      include: {
        customer: true,
        createdBy: true,
        lines: true,
        fulfillmentAllocations: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const quotationSummaries: QuotationSummaryInput[] = quotations.map((q) => {
      // Check if quote in fulfillment has backorders
      let hasBackorders = false;
      if (q.status === 'FULFILLMENT') {
        const totalReq = q.lines.reduce((acc, l) => acc + l.quantity, 0);
        const totalAlloc = q.fulfillmentAllocations.reduce(
          (acc, a) => acc + a.allocatedQuantity,
          0,
        );
        hasBackorders = totalAlloc < totalReq;
      }

      return {
        id: q.id,
        quoteNumber: q.quoteNumber,
        status: q.status,
        netValue: q.netValue,
        grossMarginPercent: q.grossMarginPercent,
        riskScore: q.riskScore,
        riskLevel: q.riskLevel,
        updatedAt: q.updatedAt,
        customerName: q.customer?.name || 'Customer',
        linesCount: q.lines.length,
        hasBackorders,
      };
    });

    // Detect deal alerts via domain engine
    const configService = new ConfigService();
    const thresholds = await configService.getBusinessThresholds();
    const stalledAlerts = detectStalledDeals(quotationSummaries, thresholds.stalledDaysThreshold);
    const leakageAlerts = detectMarginLeakage(quotationSummaries, thresholds.minMarginThreshold);
    const detectedAlerts: DetectedAlert[] = [...stalledAlerts, ...leakageAlerts];

    // Sync detected alerts into database
    for (const alert of detectedAlerts) {
      const existing = await db.dealAlert.findFirst({
        where: {
          quotationId: alert.quotationId,
          alertType: alert.alertType,
          isResolved: false,
        },
      });

      if (!existing) {
        await db.dealAlert.create({
          data: {
            quotationId: alert.quotationId,
            alertType: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            isResolved: false,
          },
        });
      }
    }

    // Fetch active un-resolved alerts from DB
    const activeDbAlerts = await db.dealAlert.findMany({
      where: { isResolved: false },
      include: {
        quotation: {
          include: { customer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const metrics = computeControlTowerMetrics(quotationSummaries, detectedAlerts);

    // Apply filtering on quotations list
    let filteredQuotes = quotations;
    if (filters.status && filters.status !== 'ALL') {
      filteredQuotes = filteredQuotes.filter((q) => q.status === filters.status);
    }
    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      filteredQuotes = filteredQuotes.filter((q) => q.riskLevel === filters.riskLevel);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filteredQuotes = filteredQuotes.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(term) ||
          q.customer?.name?.toLowerCase().includes(term),
      );
    }

    return {
      metrics,
      alerts: activeDbAlerts,
      quotations: filteredQuotes,
    };
  }

  async resolveAlert(
    alertId: string,
    actor?: { id?: string; name?: string; role?: string } | null,
  ) {
    const alert = await db.dealAlert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const updated = await db.dealAlert.update({
      where: { id: alertId },
      data: { isResolved: true },
    });

    await recordAuditEvent({
      eventType: 'DEAL_ALERT_RESOLVED',
      action: `Resolved operational deal alert: ${alert.message}`,
      entityType: 'DealAlert',
      entityId: alertId,
      actor,
      previousState: alert,
      newState: updated,
    });

    return updated;
  }
}

export const controlTowerService = new ControlTowerService();
