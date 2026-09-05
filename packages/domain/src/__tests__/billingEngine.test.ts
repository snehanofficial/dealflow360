import { describe, it, expect } from 'vitest';
import {
  calculateProration,
  calculateHybridBillingSchedule,
  QuoteLineBillingInput,
} from '../billing/billingEngine.js';

describe('Billing Engine (Domain Logic)', () => {
  describe('calculateProration', () => {
    it('should return full amount when activeDays equals daysInPeriod', () => {
      const res = calculateProration(1200, 'MONTHLY', 30, 30);
      expect(res.isProrated).toBe(false);
      expect(res.proratedAmount).toBe(1200);
    });

    it('should accurately calculate prorated amount for partial monthly period', () => {
      const res = calculateProration(1000, 'MONTHLY', 15, 30);
      expect(res.isProrated).toBe(true);
      expect(res.proratedAmount).toBe(500);
      expect(res.activeDays).toBe(15);
    });

    it('should handle zero or negative active days gracefully', () => {
      const res = calculateProration(500, 'ANNUAL', 0, 365);
      expect(res.isProrated).toBe(true);
      expect(res.proratedAmount).toBe(0);
    });
  });

  describe('calculateHybridBillingSchedule', () => {
    it('should separate one-time and recurring monthly lines into distinct schedules', () => {
      const lines: QuoteLineBillingInput[] = [
        {
          quoteLineId: 'line-1',
          productName: 'Hardware Server',
          billingType: 'ONE_TIME',
          netLinePrice: 5000,
          quantity: 1,
        },
        {
          quoteLineId: 'line-2',
          productName: 'SaaS License',
          billingType: 'RECURRING',
          recurringPeriod: 'MONTHLY',
          netLinePrice: 300,
          quantity: 5,
        },
      ];

      const startDate = new Date('2026-01-01T00:00:00.000Z');
      const schedule = calculateHybridBillingSchedule(lines, startDate, 12);

      expect(schedule.totalOneTimeAmount).toBe(5000);
      expect(schedule.totalRecurringMonthly).toBe(300);
      expect(schedule.totalRecurringAnnual).toBe(0);

      const oneTimeItems = schedule.lines.filter((l) => l.billingType === 'ONE_TIME');
      expect(oneTimeItems.length).toBe(1);
      expect(oneTimeItems[0].productName).toBe('Hardware Server');

      const recurringItems = schedule.lines.filter((l) => l.billingType === 'RECURRING');
      expect(recurringItems.length).toBe(12);
      expect(recurringItems[0].amount).toBe(300);
    });

    it('should apply initial proration when recurring monthly line starts mid-month', () => {
      const lines: QuoteLineBillingInput[] = [
        {
          quoteLineId: 'line-sub',
          productName: 'Enterprise Cloud Support',
          billingType: 'RECURRING',
          recurringPeriod: 'MONTHLY',
          netLinePrice: 600,
          quantity: 1,
        },
      ];

      // Started on 16th of January (16 days active out of 31)
      const startDate = new Date(2026, 0, 16);
      const schedule = calculateHybridBillingSchedule(lines, startDate, 12);

      const initialLine = schedule.lines[0];
      expect(initialLine.isProrated).toBe(true);
      expect(initialLine.proratedDays).toBe(16);
      expect(initialLine.amount).toBeLessThan(600);
    });
  });
});
