import { PaymentStatusEnum } from "../Enums/paymentStatusEnum";

export default interface PaymentStatusUpdateRequest {
    status: PaymentStatusEnum;
}