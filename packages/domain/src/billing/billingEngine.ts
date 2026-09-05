export type BillingType = 'ONE_TIME' | 'RECURRING';
export type RecurringPeriod = 'MONTHLY' | 'ANNUAL';

export interface QuoteLineBillingInput {
  quoteLineId: string;
  productName: string;
  billingType: BillingType;
  recurringPeriod?: RecurringPeriod | null;
  netLinePrice: number;
  quantity: number;
}

export interface ProrationResult {
  originalAmount: number;
  proratedAmount: number;
  activeDays: number;
  daysInPeriod: number;
  isProrated: boolean;
}

export interface GeneratedBillingLine {
  quoteLineId: string | null;
  productName: string;
  billingType: BillingType;
  recurringPeriod: RecurringPeriod | null;
  billingDate: Date;
  amount: number;
  proratedDays: number | null;
  isProrated: boolean;
  status: string;
}

export interface HybridBillingScheduleResult {
  totalOneTimeAmount: number;
  totalRecurringMonthly: number;
  totalRecurringAnnual: number;
  billingStartDate: Date;
  lines: GeneratedBillingLine[];
}

/**
 * Calculates exact proration for a partial billing period.
 * Formula: Prorated Amount = Recurring Amount * (Active Days / Days in Period)
 */
export function calculateProration(
  recurringAmount: number,
  period: RecurringPeriod,
  activeDays: number,
  daysInPeriod?: number,
): ProrationResult {
  const totalDays = daysInPeriod || (period === 'MONTHLY' ? 30 : 365);
  const clampedActiveDays = Math.max(0, Math.min(activeDays, totalDays));
  const isProrated = clampedActiveDays < totalDays;

  const proratedAmount = isProrated
    ? Math.round((recurringAmount * (clampedActiveDays / totalDays)) * 100) / 100
    : Math.round(recurringAmount * 100) / 100;

  return {
    originalAmount: Math.round(recurringAmount * 100) / 100,
    proratedAmount,
    activeDays: clampedActiveDays,
    daysInPeriod: totalDays,
    isProrated,
  };
}

/**
 * Generates deterministic hybrid billing schedule for one-time and recurring lines.
 * One-Time lines are billed 100% upfront on start date.
 * Recurring lines generate 12-month schedule items with optional initial proration.
 */
export function calculateHybridBillingSchedule(
  lines: QuoteLineBillingInput[],
  startDate: Date = new Date(),
  horizonMonths: number = 12,
): HybridBillingScheduleResult {
  let totalOneTimeAmount = 0;
  let totalRecurringMonthly = 0;
  let totalRecurringAnnual = 0;
  const generatedLines: GeneratedBillingLine[] = [];

  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();

  for (const line of lines) {
    const linePrice = Math.round(line.netLinePrice * 100) / 100;

    if (line.billingType === 'ONE_TIME' || !line.recurringPeriod) {
      totalOneTimeAmount += linePrice;
      generatedLines.push({
        quoteLineId: line.quoteLineId,
        productName: line.productName,
        billingType: 'ONE_TIME',
        recurringPeriod: null,
        billingDate: new Date(startDate),
        amount: linePrice,
        proratedDays: null,
        isProrated: false,
        status: 'PENDING',
      });
    } else if (line.recurringPeriod === 'MONTHLY') {
      totalRecurringMonthly += linePrice;

      // Check for partial month proration (if starting after 1st of month)
      let initialMonthDays = 30;
      let activeDays = 30;
      if (startDay > 1) {
        // Number of days in current start month
        initialMonthDays = new Date(startYear, startMonth + 1, 0).getDate();
        activeDays = initialMonthDays - startDay + 1;
      }

      const proration = calculateProration(linePrice, 'MONTHLY', activeDays, initialMonthDays);

      // Month 0 (initial installment)
      generatedLines.push({
        quoteLineId: line.quoteLineId,
        productName: line.productName,
        billingType: 'RECURRING',
        recurringPeriod: 'MONTHLY',
        billingDate: new Date(startDate),
        amount: proration.proratedAmount,
        proratedDays: proration.isProrated ? proration.activeDays : null,
        isProrated: proration.isProrated,
        status: 'PENDING',
      });

      // Subsequent full monthly installments for horizon
      for (let m = 1; m < horizonMonths; m++) {
        const nextDate = new Date(startYear, startMonth + m, startDay > 28 ? 28 : startDay);
        generatedLines.push({
          quoteLineId: line.quoteLineId,
          productName: line.productName,
          billingType: 'RECURRING',
          recurringPeriod: 'MONTHLY',
          billingDate: nextDate,
          amount: linePrice,
          proratedDays: null,
          isProrated: false,
          status: 'PENDING',
        });
      }
    } else if (line.recurringPeriod === 'ANNUAL') {
      totalRecurringAnnual += linePrice;

      // Annual installment on start date
      generatedLines.push({
        quoteLineId: line.quoteLineId,
        productName: line.productName,
        billingType: 'RECURRING',
        recurringPeriod: 'ANNUAL',
        billingDate: new Date(startDate),
        amount: linePrice,
        proratedDays: null,
        isProrated: false,
        status: 'PENDING',
      });

      // Subsequent annual installments (if horizon exceeds 1 year)
      const annualCount = Math.floor(horizonMonths / 12);
      for (let y = 1; y <= annualCount; y++) {
        const nextDate = new Date(startYear + y, startMonth, startDay);
        generatedLines.push({
          quoteLineId: line.quoteLineId,
          productName: line.productName,
          billingType: 'RECURRING',
          recurringPeriod: 'ANNUAL',
          billingDate: nextDate,
          amount: linePrice,
          proratedDays: null,
          isProrated: false,
          status: 'PENDING',
        });
      }
    }
  }

  // Sort schedule items chronologically by billing date
  generatedLines.sort((a, b) => a.billingDate.getTime() - b.billingDate.getTime());

  return {
    totalOneTimeAmount: Math.round(totalOneTimeAmount * 100) / 100,
    totalRecurringMonthly: Math.round(totalRecurringMonthly * 100) / 100,
    totalRecurringAnnual: Math.round(totalRecurringAnnual * 100) / 100,
    billingStartDate: startDate,
    lines: generatedLines,
  };
}
