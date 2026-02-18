export interface PaymentSummaryByMethod {
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}
