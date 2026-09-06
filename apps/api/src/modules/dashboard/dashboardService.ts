import { db } from '@dealflow360/db';
import {
  DashboardResponseDto,
  DashboardKpiDto,
  DashboardAlertDto,
  DashboardPipelineStageDto,
  DashboardRecentQuotationDto,
  DashboardPendingApprovalDto,
  DashboardRecentActivityDto,
  Role,
} from '@dealflow360/contracts';
import { AuthenticatedUser } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class DashboardService {
  async getDashboard(user: AuthenticatedUser): Promise<DashboardResponseDto> {
    const role = user.role as Role;

    switch (role) {
      case 'ADMIN':
        return this.getAdminDashboard(user);
      case 'SALES_MANAGER':
        return this.getSalesManagerDashboard(user);
      case 'SALES_REP':
        return this.getSalesRepDashboard(user);
      case 'FINANCE_OPERATIONS':
        return this.getFinanceDashboard(user);
      case 'CUSTOMER':
        return this.getCustomerDashboard(user);
      default:
        return this.getSalesRepDashboard(user);
    }
  }

  private formatCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  private async getAdminDashboard(user: AuthenticatedUser): Promise<DashboardResponseDto> {
    const [
      totalQuotesCount,
      quoteTotalsAggregate,
      highRiskDealsCount,
      pendingApprovalsCount,
      fulfillmentCount,
      stockShortagesCount,
      quotesByStatus,
      recentQuotes,
      pendingApprovalsList,
      recentAuditLogs,
    ] = await Promise.all([
      db.quotation.count(),
      db.quotation.aggregate({ _sum: { netValue: true } }),
      db.quotation.count({ where: { riskLevel: 'HIGH' } }),
      db.approvalRequest.count({ where: { status: 'PENDING' } }),
      db.fulfillmentAllocation.count({ where: { status: { in: ['RESERVED', 'PICKING', 'PACKED'] } } }),
      db.inventoryItem.count({ where: { availableQuantity: { lte: 5 } } }),
      db.quotation.groupBy({
        by: ['status'],
        _count: true,
        _sum: { netValue: true },
      }),
      db.quotation.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { customer: true },
      }),
      db.approvalRequest.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quotation: { include: { customer: true } } },
      }),
      db.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue = quoteTotalsAggregate._sum.netValue || 0;

    const kpis: DashboardKpiDto[] = [
      {
        id: 'total-quotations',
        label: 'Total Quotations',
        value: totalQuotesCount,
        formattedValue: totalQuotesCount.toString(),
        icon: 'FileText',
        actionUrl: '/quotations',
      },
      {
        id: 'estimated-revenue',
        label: 'Estimated Revenue',
        value: totalRevenue,
        formattedValue: this.formatCurrency(totalRevenue),
        icon: 'DollarSign',
        actionUrl: '/quotations',
      },
      {
        id: 'high-risk-deals',
        label: 'High Risk Deals',
        value: highRiskDealsCount,
        formattedValue: highRiskDealsCount.toString(),
        icon: 'ShieldAlert',
        actionUrl: '/control-tower',
      },
      {
        id: 'pending-approvals',
        label: 'Pending Approvals',
        value: pendingApprovalsCount,
        formattedValue: pendingApprovalsCount.toString(),
        icon: 'CheckCircle',
        actionUrl: '/approvals',
      },
      {
        id: 'orders-fulfillment',
        label: 'Orders in Fulfillment',
        value: fulfillmentCount,
        formattedValue: fulfillmentCount.toString(),
        icon: 'Truck',
        actionUrl: '/fulfillment',
      },
    ];

    const alerts: DashboardAlertDto[] = [];
    if (pendingApprovalsCount > 0) {
      alerts.push({
        id: 'admin-pending-approvals',
        title: 'Commercial Approvals Bottleneck',
        description: `${pendingApprovalsCount} quotation(s) are awaiting commercial policy approval.`,
        severity: pendingApprovalsCount > 5 ? 'CRITICAL' : 'HIGH',
        category: 'APPROVAL',
        actionUrl: '/approvals',
        actionLabel: 'Review Approvals',
      });
    }
    if (stockShortagesCount > 0) {
      alerts.push({
        id: 'admin-stock-shortage',
        title: 'Inventory Stock Alerts',
        description: `${stockShortagesCount} product(s) are at low or critical stock levels across warehouses.`,
        severity: 'HIGH',
        category: 'INVENTORY',
        actionUrl: '/inventory',
        actionLabel: 'View Inventory',
      });
    }

    const pipeline = this.buildPipelineStages(quotesByStatus);

    return {
      role: 'ADMIN',
      user: { id: user.userId, name: user.email.split('@')[0], email: user.email },
      kpis,
      alerts,
      pipeline,
      recentQuotations: recentQuotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        customerName: q.customer?.name || 'Unknown Customer',
        value: q.netValue,
        formattedValue: this.formatCurrency(q.netValue),
        riskLevel: q.riskLevel,
        status: q.status,
        updatedAt: q.updatedAt.toISOString(),
      })),
      pendingApprovals: pendingApprovalsList.map((a) => ({
        id: a.id,
        quoteNumber: a.quotation?.quoteNumber || 'N/A',
        customerName: a.quotation?.customer?.name || 'N/A',
        value: a.netTotal,
        formattedValue: this.formatCurrency(a.netTotal),
        requestedAt: a.createdAt.toISOString(),
      })),
      recentActivity: recentAuditLogs.map((log) => ({
        id: log.id,
        eventType: log.eventType,
        action: log.action,
        actorName: log.actorName || 'System',
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }

  private async getSalesManagerDashboard(user: AuthenticatedUser): Promise<DashboardResponseDto> {
    const [
      totalQuotesCount,
      quoteTotalsAggregate,
      highRiskDealsCount,
      pendingManagerApprovalsCount,
      negotiatingCount,
      quotesByStatus,
      recentQuotes,
      pendingApprovalsList,
      counterOffersList,
    ] = await Promise.all([
      db.quotation.count(),
      db.quotation.aggregate({ _sum: { netValue: true } }),
      db.quotation.count({ where: { riskLevel: 'HIGH' } }),
      db.approvalStep.count({ where: { requiredRole: 'SALES_MANAGER', status: 'PENDING' } }),
      db.quotation.count({ where: { status: 'NEGOTIATING' } }),
      db.quotation.groupBy({
        by: ['status'],
        _count: true,
        _sum: { netValue: true },
      }),
      db.quotation.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { customer: true },
      }),
      db.approvalRequest.findMany({
        where: {
          status: 'PENDING',
          steps: { some: { requiredRole: 'SALES_MANAGER', status: 'PENDING' } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quotation: { include: { customer: true } } },
      }),
      db.counterOffer.findMany({
        where: { status: 'SUBMITTED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quotation: { include: { customer: true } } },
      }),
    ]);

    const totalRevenue = quoteTotalsAggregate._sum.netValue || 0;

    const kpis: DashboardKpiDto[] = [
      {
        id: 'team-quotations',
        label: 'Team Quotations',
        value: totalQuotesCount,
        formattedValue: totalQuotesCount.toString(),
        icon: 'FileText',
        actionUrl: '/quotations',
      },
      {
        id: 'team-pipeline-value',
        label: 'Team Pipeline Value',
        value: totalRevenue,
        formattedValue: this.formatCurrency(totalRevenue),
        icon: 'DollarSign',
        actionUrl: '/quotations',
      },
      {
        id: 'high-risk-deals',
        label: 'High Risk Deals',
        value: highRiskDealsCount,
        formattedValue: highRiskDealsCount.toString(),
        icon: 'ShieldAlert',
        actionUrl: '/control-tower',
      },
      {
        id: 'pending-manager-approvals',
        label: 'Pending Manager Approvals',
        value: pendingManagerApprovalsCount,
        formattedValue: pendingManagerApprovalsCount.toString(),
        icon: 'CheckCircle',
        actionUrl: '/approvals',
      },
      {
        id: 'deals-in-negotiation',
        label: 'Deals in Negotiation',
        value: negotiatingCount,
        formattedValue: negotiatingCount.toString(),
        icon: 'Truck',
        actionUrl: '/quotations',
      },
    ];

    const alerts: DashboardAlertDto[] = [];
    if (pendingManagerApprovalsCount > 0) {
      alerts.push({
        id: 'sm-pending-approvals',
        title: 'Manager Approvals Required',
        description: `You have ${pendingManagerApprovalsCount} discount approval request(s) awaiting your action.`,
        severity: 'HIGH',
        category: 'APPROVAL',
        actionUrl: '/approvals',
        actionLabel: 'Review Inbox',
      });
    }
    if (counterOffersList.length > 0) {
      alerts.push({
        id: 'sm-counteroffers',
        title: 'Customer Counteroffers Submitted',
        description: `${counterOffersList.length} customer counteroffer(s) submitted requiring commercial review.`,
        severity: 'NORMAL',
        category: 'NEGOTIATION',
        actionUrl: '/quotations',
        actionLabel: 'View Counteroffers',
      });
    }

    const pipeline = this.buildPipelineStages(quotesByStatus);

    return {
      role: 'SALES_MANAGER',
      user: { id: user.userId, name: user.email.split('@')[0], email: user.email },
      kpis,
      alerts,
      pipeline,
      recentQuotations: recentQuotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        customerName: q.customer?.name || 'Unknown Customer',
        value: q.netValue,
        formattedValue: this.formatCurrency(q.netValue),
        riskLevel: q.riskLevel,
        status: q.status,
        updatedAt: q.updatedAt.toISOString(),
      })),
      pendingApprovals: pendingApprovalsList.map((a) => ({
        id: a.id,
        quoteNumber: a.quotation?.quoteNumber || 'N/A',
        customerName: a.quotation?.customer?.name || 'N/A',
        value: a.netTotal,
        formattedValue: this.formatCurrency(a.netTotal),
        requestedAt: a.createdAt.toISOString(),
      })),
      recentActivity: [],
    };
  }

  private async getSalesRepDashboard(user: AuthenticatedUser): Promise<DashboardResponseDto> {
    const userId = user.userId;

    const [
      myQuotesCount,
      myQuoteTotalsAggregate,
      myHighRiskCount,
      myPendingApprovalsCount,
      myNegotiationsCount,
      quotesByStatus,
      recentQuotes,
      pendingApprovalsList,
      counterOffersList,
    ] = await Promise.all([
      db.quotation.count({ where: { createdById: userId } }),
      db.quotation.aggregate({
        where: { createdById: userId },
        _sum: { netValue: true },
      }),
      db.quotation.count({ where: { createdById: userId, riskLevel: 'HIGH' } }),
      db.approvalRequest.count({
        where: { requestedById: userId, status: 'PENDING' },
      }),
      db.quotation.count({ where: { createdById: userId, status: 'NEGOTIATING' } }),
      db.quotation.groupBy({
        by: ['status'],
        where: { createdById: userId },
        _count: true,
        _sum: { netValue: true },
      }),
      db.quotation.findMany({
        where: { createdById: userId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { customer: true },
      }),
      db.approvalRequest.findMany({
        where: { requestedById: userId, status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quotation: { include: { customer: true } } },
      }),
      db.counterOffer.findMany({
        where: { quotation: { createdById: userId }, status: 'SUBMITTED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quotation: { include: { customer: true } } },
      }),
    ]);

    const totalRevenue = myQuoteTotalsAggregate._sum.netValue || 0;

    const kpis: DashboardKpiDto[] = [
      {
        id: 'my-quotations',
        label: 'My Quotations',
        value: myQuotesCount,
        formattedValue: myQuotesCount.toString(),
        icon: 'FileText',
        actionUrl: '/quotations',
      },
      {
        id: 'my-pipeline-value',
        label: 'My Pipeline Value',
        value: totalRevenue,
        formattedValue: this.formatCurrency(totalRevenue),
        icon: 'DollarSign',
        actionUrl: '/quotations',
      },
      {
        id: 'high-risk-deals',
        label: 'High Risk Deals',
        value: myHighRiskCount,
        formattedValue: myHighRiskCount.toString(),
        icon: 'ShieldAlert',
        actionUrl: '/control-tower',
      },
      {
        id: 'pending-approvals',
        label: 'Pending Approvals',
        value: myPendingApprovalsCount,
        formattedValue: myPendingApprovalsCount.toString(),
        icon: 'CheckCircle',
        actionUrl: '/approvals',
      },
      {
        id: 'in-negotiation',
        label: 'Active Negotiations',
        value: myNegotiationsCount,
        formattedValue: myNegotiationsCount.toString(),
        icon: 'Truck',
        actionUrl: '/quotations',
      },
    ];

    const alerts: DashboardAlertDto[] = [];
    if (counterOffersList.length > 0) {
      alerts.push({
        id: 'sr-counteroffer-received',
        title: 'Customer Counteroffer Received',
        description: `Customer submitted a counteroffer on ${counterOffersList[0]?.quotation?.quoteNumber || 'a quote'}.`,
        severity: 'HIGH',
        category: 'NEGOTIATION',
        actionUrl: `/quotations/${counterOffersList[0]?.quotationId}`,
        actionLabel: 'Review Quote',
      });
    }
    if (myPendingApprovalsCount > 0) {
      alerts.push({
        id: 'sr-approval-pending',
        title: 'Discount Approval Pending',
        description: `You have ${myPendingApprovalsCount} quotation(s) awaiting manager or finance approval.`,
        severity: 'NORMAL',
        category: 'APPROVAL',
        actionUrl: '/approvals',
        actionLabel: 'View Status',
      });
    }

    const pipeline = this.buildPipelineStages(quotesByStatus);

    return {
      role: 'SALES_REP',
      user: { id: user.userId, name: user.email.split('@')[0], email: user.email },
      kpis,
      alerts,
      pipeline,
      recentQuotations: recentQuotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        customerName: q.customer?.name || 'Unknown Customer',
        value: q.netValue,
        formattedValue: this.formatCurrency(q.netValue),
        riskLevel: q.riskLevel,
        status: q.status,
        updatedAt: q.updatedAt.toISOString(),
      })),
      pendingApprovals: pendingApprovalsList.map((a) => ({
        id: a.id,
        quoteNumber: a.quotation?.quoteNumber || 'N/A',
        customerName: a.quotation?.customer?.name || 'N/A',
        value: a.netTotal,
        formattedValue: this.formatCurrency(a.netTotal),
        requestedAt: a.createdAt.toISOString(),
      })),
      recentActivity: [],
    };
  }

  private async getFinanceDashboard(user: AuthenticatedUser): Promise<DashboardResponseDto> {
    const [
      fulfillmentPendingCount,
      fulfillmentPickingCount,
      inventoryShortagesCount,
      invoicesIssuedCount,
      invoicesAggregate,
      pendingFinanceApprovalsCount,
      recentInvoices,
      pendingApprovalsList,
    ] = await Promise.all([
      db.fulfillmentAllocation.count({ where: { status: 'RESERVED' } }),
      db.fulfillmentAllocation.count({ where: { status: 'PICKING' } }),
      db.inventoryItem.count({ where: { availableQuantity: { lte: 5 } } }),
      db.invoice.count({ where: { status: 'ISSUED' } }),
      db.invoice.aggregate({
        where: { status: 'ISSUED' },
        _sum: { totalAmount: true },
      }),
      db.approvalStep.count({ where: { requiredRole: 'FINANCE_OPERATIONS', status: 'PENDING' } }),
      db.invoice.findMany({
        take: 5,
        orderBy: { issueDate: 'desc' },
        include: { quotation: true },
      }),
      db.approvalRequest.findMany({
        where: {
          status: 'PENDING',
          steps: { some: { requiredRole: 'FINANCE_OPERATIONS', status: 'PENDING' } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { quotation: { include: { customer: true } } },
      }),
    ]);

    const totalOutstanding = invoicesAggregate._sum.totalAmount || 0;

    const kpis: DashboardKpiDto[] = [
      {
        id: 'orders-to-fulfill',
        label: 'Orders to Fulfill',
        value: fulfillmentPendingCount,
        formattedValue: fulfillmentPendingCount.toString(),
        icon: 'Truck',
        actionUrl: '/fulfillment',
      },
      {
        id: 'orders-picking',
        label: 'Orders in Picking',
        value: fulfillmentPickingCount,
        formattedValue: fulfillmentPickingCount.toString(),
        icon: 'FileText',
        actionUrl: '/fulfillment',
      },
      {
        id: 'inventory-alerts',
        label: 'Stock Shortage Alerts',
        value: inventoryShortagesCount,
        formattedValue: inventoryShortagesCount.toString(),
        icon: 'ShieldAlert',
        actionUrl: '/inventory',
      },
      {
        id: 'invoices-pending',
        label: 'Issued Invoices',
        value: invoicesIssuedCount,
        formattedValue: invoicesIssuedCount.toString(),
        icon: 'DollarSign',
        actionUrl: '/invoices',
      },
      {
        id: 'outstanding-amount',
        label: 'Outstanding Invoices Value',
        value: totalOutstanding,
        formattedValue: this.formatCurrency(totalOutstanding),
        icon: 'CheckCircle',
        actionUrl: '/invoices',
      },
    ];

    const alerts: DashboardAlertDto[] = [];
    if (pendingFinanceApprovalsCount > 0) {
      alerts.push({
        id: 'fin-pending-approvals',
        title: 'Finance Approval Required',
        description: `You have ${pendingFinanceApprovalsCount} margin violation approval request(s) awaiting finance action.`,
        severity: 'HIGH',
        category: 'APPROVAL',
        actionUrl: '/approvals',
        actionLabel: 'Review Finance Approvals',
      });
    }
    if (inventoryShortagesCount > 0) {
      alerts.push({
        id: 'fin-stock-shortage',
        title: 'Warehouse Stock Shortage',
        description: `${inventoryShortagesCount} inventory item(s) have fallen below safety threshold.`,
        severity: 'HIGH',
        category: 'INVENTORY',
        actionUrl: '/inventory',
        actionLabel: 'View Warehouse Stock',
      });
    }

    return {
      role: 'FINANCE_OPERATIONS',
      user: { id: user.userId, name: user.email.split('@')[0], email: user.email },
      kpis,
      alerts,
      pipeline: [],
      recentQuotations: recentInvoices.map((inv) => ({
        id: inv.id,
        quoteNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        value: inv.totalAmount,
        formattedValue: this.formatCurrency(inv.totalAmount),
        riskLevel: 'LOW',
        status: inv.status,
        updatedAt: inv.updatedAt.toISOString(),
      })),
      pendingApprovals: pendingApprovalsList.map((a) => ({
        id: a.id,
        quoteNumber: a.quotation?.quoteNumber || 'N/A',
        customerName: a.quotation?.customer?.name || 'N/A',
        value: a.netTotal,
        formattedValue: this.formatCurrency(a.netTotal),
        requestedAt: a.createdAt.toISOString(),
      })),
      recentActivity: [],
    };
  }

  private async getCustomerDashboard(user: AuthenticatedUser): Promise<DashboardResponseDto> {
    let customerId = user.customerId;
    let customerName = user.email.split('@')[0];

    if (!customerId) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.userId);
        const dbUser = await db.user.findFirst({
          where: isUuid
            ? { OR: [{ id: user.userId }, { email: user.email }] }
            : { email: user.email },
          include: { customer: true },
        });
        if (dbUser?.customerId && dbUser.customer) {
          customerId = dbUser.customerId;
          customerName = dbUser.customer.name;
        }
      } catch {
        // Ignore DB query errors for synthetic/non-UUID test tokens
      }
    } else {
      try {
        const cust = await db.customer.findUnique({ where: { id: customerId } });
        if (cust) {
          customerName = cust.name;
        }
      } catch {
        // Ignore DB query errors
      }
    }

    if (!customerId) {
      throw new AppError('FORBIDDEN', 'User account is not bound to a valid customer account.', 403);
    }

    const [
      custQuotesCount,
      custQuotesTotals,
      custCounterOffersCount,
      custOrdersCount,
      custInvoicesCount,
      recentQuotes,
      recentInvoices,
    ] = await Promise.all([
      db.quotation.count({ where: { customerId } }),
      db.quotation.aggregate({ where: { customerId }, _sum: { netValue: true } }),
      db.counterOffer.count({ where: { quotation: { customerId }, status: 'SUBMITTED' } }),
      db.fulfillmentAllocation.count({ where: { quotation: { customerId } } }),
      db.invoice.count({ where: { customerId } }),
      db.quotation.findMany({
        where: { customerId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { customer: true },
      }),
      db.invoice.findMany({
        where: { customerId },
        take: 5,
        orderBy: { issueDate: 'desc' },
      }),
    ]);

    const totalNetValue = custQuotesTotals._sum.netValue || 0;

    const kpis: DashboardKpiDto[] = [
      {
        id: 'cust-quotes',
        label: 'My Quotations',
        value: custQuotesCount,
        formattedValue: custQuotesCount.toString(),
        icon: 'FileText',
        actionUrl: '/quotations',
      },
      {
        id: 'cust-total-value',
        label: 'Total Quotation Value',
        value: totalNetValue,
        formattedValue: this.formatCurrency(totalNetValue),
        icon: 'DollarSign',
        actionUrl: '/quotations',
      },
      {
        id: 'cust-pending-counteroffers',
        label: 'Counteroffers Awaiting Action',
        value: custCounterOffersCount,
        formattedValue: custCounterOffersCount.toString(),
        icon: 'CheckCircle',
        actionUrl: '/quotations',
      },
      {
        id: 'cust-orders',
        label: 'Active Orders',
        value: custOrdersCount,
        formattedValue: custOrdersCount.toString(),
        icon: 'Truck',
        actionUrl: '/fulfillment',
      },
      {
        id: 'cust-invoices',
        label: 'My Invoices',
        value: custInvoicesCount,
        formattedValue: custInvoicesCount.toString(),
        icon: 'DollarSign',
        actionUrl: '/invoices',
      },
    ];

    const alerts: DashboardAlertDto[] = [];
    if (custCounterOffersCount > 0) {
      alerts.push({
        id: 'cust-counteroffer-pending',
        title: 'Counteroffer Submitted',
        description: 'Your proposed counteroffer is currently under review by DealFlow360 team.',
        severity: 'NORMAL',
        category: 'NEGOTIATION',
        actionUrl: '/quotations',
        actionLabel: 'View Status',
      });
    }

    return {
      role: 'CUSTOMER',
      user: { id: user.userId, name: customerName, email: user.email },
      kpis,
      alerts,
      pipeline: [],
      recentQuotations: recentQuotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        customerName: customerName,
        value: q.netValue,
        formattedValue: this.formatCurrency(q.netValue),
        riskLevel: q.riskLevel,
        status: q.status,
        updatedAt: q.updatedAt.toISOString(),
      })),
      pendingApprovals: [],
      recentActivity: [],
    };
  }

  private buildPipelineStages(
    quotesByStatus: Array<{ status: string; _count: number; _sum: { netValue: number | null } }>,
  ): DashboardPipelineStageDto[] {
    const stageColors: Record<string, string> = {
      DRAFT: '#E2E8F0',
      PENDING_MANAGER: '#FEF08A',
      PENDING_FINANCE: '#FED7AA',
      APPROVED: '#BBF7D0',
      NEGOTIATING: '#BAE6FD',
      FULFILLMENT: '#DDD6FE',
      BILLING: '#C4B5FD',
      COMPLETED: '#86EFAC',
      REJECTED: '#FCA5A5',
    };

    const statusMap = new Map<string, { count: number; value: number }>();
    quotesByStatus.forEach((item) => {
      statusMap.set(item.status, {
        count: item._count,
        value: item._sum.netValue || 0,
      });
    });

    const defaultStages = ['DRAFT', 'Submitted', 'Under Review', 'APPROVED', 'FULFILLMENT'];

    return defaultStages.map((stageName) => {
      let matchingStatus = stageName.toUpperCase();
      if (stageName === 'Submitted') matchingStatus = 'PENDING_MANAGER';
      if (stageName === 'Under Review') matchingStatus = 'PENDING_FINANCE';

      const data = statusMap.get(matchingStatus) || statusMap.get(stageName) || { count: 0, value: 0 };
      return {
        name: stageName,
        count: data.count,
        value: Math.round(data.value / 1000), // value in Thousands for funnel display
        color: stageColors[matchingStatus] || '#E2E8F0',
      };
    });
  }
}

export const dashboardService = new DashboardService();
