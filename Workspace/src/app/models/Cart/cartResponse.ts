import CustomerDataRequest from "../Customer/customerDataRequest";
import { CartStatusEnum } from "../Enums/cartStatusEnum";
import { OrderStatusEnum } from "../Enums/orderStatusEnum";

export default interface CartResponse {
  id: string;
  userId?: string | null; // foreign key -> User.userId (nullable for guest carts)
  total: number;
  customer: CustomerDataRequest;
  status: OrderStatusEnum;
  cartStatus: CartStatusEnum;
  createdAt?: string,
  lastModifiedAt?: string,
  completedAt?: string; // ISO - cuándo se completó (para filtrar por fechas)
  deliveredAt?: string; // ISO: fecha/hora de entrega
  admReceivedAt?: string,
  deleted: boolean;
}