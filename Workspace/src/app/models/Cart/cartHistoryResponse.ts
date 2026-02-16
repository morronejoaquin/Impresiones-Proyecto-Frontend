import OrderItemResponse from "../OrderItem/orderItemResponse";

export default interface CartHistoryResponse {
  cartId: string;
  createdAt: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItemResponse[];
}