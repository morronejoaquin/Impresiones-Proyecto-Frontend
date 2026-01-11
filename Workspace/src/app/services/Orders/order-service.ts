import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import OrderItem from '../../models/OrderItem/orderItem';
import OrderItemCreateRequest from '../../models/OrderItem/orderItemCreateRequest';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
    readonly url='http://localhost:8080/orderItems'

OrderItem:OrderItem[]=[]
constructor(private http:HttpClient) { }

getOrderById(id:string): Observable<OrderItem>{
  return this.http.get<OrderItem>(`${this.url}/${id}`);
}

getOrdersFromCart(cartId:string){
  return this.http.get<OrderItem[]>(`${this.url}?cartId=${cartId}`);
}

postOrderToCart(cartId: string, order: OrderItemCreateRequest){
  return this.http.post<OrderItem>(`${this.url}/carts/${cartId}/agregar-item`,order);
}

updateOrder(id: string, order: Partial<OrderItem>){
  return this.http.put<OrderItem>(`${this.url}/${id}`,order);
}

deleteOrderFromCart(id:string){
  return this.http.delete<OrderItem>(`${this.url}/${id}`);
}

calculateTotal(orders: OrderItem[]): number {
        // Corrección importante: sumar (amount * copies)
        return orders.reduce((total, order) => total + (order.amount * (order.copies || 1)), 0);
}
}
