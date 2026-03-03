import OrderItemResponse from "../OrderItem/orderItemResponse";

export default interface CartHistoryResponse {
  cartId: string;
  admReceivedAt: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItemResponse[];
}