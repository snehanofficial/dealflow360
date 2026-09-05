export * from './quoteEngine.js';

export interface QuoteHeader {
  id: string;
  customerId: string;
  salesRepId: string;
  totalNet: number;
}

