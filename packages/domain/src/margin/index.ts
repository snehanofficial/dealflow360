export interface MarginInput {
  revenue: number;
  cost: number;
}

export interface MarginResult {
  revenue: number;
  cost: number;
  grossProfit: number;
  marginPercentage: number;
}
