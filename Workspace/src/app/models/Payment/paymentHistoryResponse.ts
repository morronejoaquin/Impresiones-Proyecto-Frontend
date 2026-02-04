import { PaymentMethodEnum } from "../Enums/paymentMethodEnum";
import { PaymentStatusEnum } from "../Enums/paymentStatusEnum";

export default interface PaymentHistoryResponse {
  id: string;
  cartId: string;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  finalPrice: number;
  depositAmount: number;
  orderDate: Date;
}