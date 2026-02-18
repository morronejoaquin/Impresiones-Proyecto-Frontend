import { PaymentSummaryByMethod } from './paymentSummaryByMethod';

export interface PaymentReconciliationData {
  totalCollected: number;
  summaryByMethod: PaymentSummaryByMethod[];
  cashTotal: number;
  mercadoPagoTotal: number;
}
