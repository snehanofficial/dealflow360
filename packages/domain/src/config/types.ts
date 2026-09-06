export interface BusinessThresholds {
  discountThreshold: number;
  marginMinimum: number;
  marginWarning: number;
  stalledDaysThreshold: number;
  minMarginThreshold: number;
}

export const DEFAULT_BUSINESS_THRESHOLDS: BusinessThresholds = {
  discountThreshold: 10,
  marginMinimum: 20,
  marginWarning: 30,
  stalledDaysThreshold: 7,
  minMarginThreshold: 25,
};
