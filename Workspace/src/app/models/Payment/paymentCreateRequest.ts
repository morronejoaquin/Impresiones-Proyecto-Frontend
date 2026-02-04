import { PaymentMethodEnum } from "../Enums/paymentMethodEnum";

export default interface PaymentCreateRequest{
    paymentMethod: PaymentMethodEnum;
}