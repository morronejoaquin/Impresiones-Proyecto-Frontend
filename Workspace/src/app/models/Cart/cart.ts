import OrderItem from "../OrderItem/orderItem";

export interface CustomerData {
  name: string;
  surname: string;
  phone: string;
}

export default interface Cart {
  id: string;
  userId?: string | null; // foreign key -> User.userId (nullable for guest carts)
  total: number;
  customer: CustomerData;
  status: 'pending' | 'printing' | 'binding' | 'ready' | 'delivered' | 'cancelled';
  cartStatus: 'pending' | 'completed' // para saber si el carrito ya fue usado
  completedAt?: string; // ISO - cuándo se completó (para filtrar por fechas)
  deliveredAt?: string; // ISO: fecha/hora de entrega
  deleted: boolean;
  items?: OrderItem[];
}