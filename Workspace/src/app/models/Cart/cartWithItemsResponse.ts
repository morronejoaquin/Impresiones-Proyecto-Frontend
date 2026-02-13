import CustomerDataRequest from "../Customer/customerDataRequest";
import CustomerDataResponse from "../Customer/customerDataResponse";
import { CartStatusEnum } from "../Enums/cartStatusEnum";
import { OrderStatusEnum } from "../Enums/orderStatusEnum";
import OrderItemResponse from "../OrderItem/orderItemResponse";

export default interface CartWithItemsResponse{
    id: string;
    userId?: string | null;
    total: number;
    customer: CustomerDataResponse;
    status: OrderStatusEnum;
    cartStatus: CartStatusEnum;
    createdAt?: string,
    lastModifiedAt?: string,
    completedAt?: string;
    deliveredAt?: string;
    admReceivedAt?: string,
    deleted: boolean;
    items: OrderItemResponse[]
}