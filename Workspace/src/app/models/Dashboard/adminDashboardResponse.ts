import { OrderSummaryByStatus } from "./orderSummaryByStatus";
import { PaymentSummaryByMethod } from "./paymentSummaryByMethod";
import { PrintingStatistics } from "./printingStatistics";

export default interface AdminDashboardResponse {
    orderSummary: OrderSummaryByStatus[];
    paymentSummary: PaymentSummaryByMethod[];
    printingStats: PrintingStatistics;
}