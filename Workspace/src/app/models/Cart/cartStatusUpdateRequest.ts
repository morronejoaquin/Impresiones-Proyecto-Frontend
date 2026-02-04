import { OrderStatusEnum } from "../Enums/orderStatusEnum";

export default interface CartStatusUpdateRequest{
    status: OrderStatusEnum;
}