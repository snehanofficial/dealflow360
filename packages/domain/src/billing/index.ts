export type BillingFrequency = 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';

export interface BillingLineSummary {
  lineType: BillingFrequency;
  amount: number;
}
