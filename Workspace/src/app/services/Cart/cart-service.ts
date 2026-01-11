import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Cart from '../../models/Cart/cart';
import { OrderService } from '../Orders/order-service';
import OrderItem from '../../models/OrderItem/orderItem';

export interface CartWithItems extends Cart {
  orderItems: OrderItem[];
  fileSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly url='http://localhost:8080/carts'

  Cart:Cart[]=[]
  constructor(private http:HttpClient, private orderService: OrderService) { }


  getCartItems(){
    return this.http.get<Cart[]>(this.url);
  }

  getCartByUserId(userId: string): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.url}?userId=${userId}&cartStatus=pending`);
  }
  
  updateCart(cartId: string, updates: Partial<Cart>): Observable<Cart> {
    return this.http.put<Cart>(`${this.url}/${cartId}`, updates);
  }

  postCart(cart: Cart) {
    return this.http.post<any>(this.url, cart);
    //Se lo envia al administrador o empleado
  }
  
  deleteCart(cartId: string){
    return this.http.delete<any>(`${this.url}/${cartId}`);
  }

  clearOrdersInCart(cartId: string){
    
  }

  getOrCreateActiveCart(userId: string){
    
  }

  getCartById(id: string) {
    return this.http.get<Cart>(`http://localhost:8080/carts/${id}`);
  }

}
