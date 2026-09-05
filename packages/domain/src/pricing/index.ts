export interface PricingInput {
  unitPrice: number;
  quantity: number;
  discountPercentage: number;
}

export interface PricingResult {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount: number;
  netAmount: number;
}
