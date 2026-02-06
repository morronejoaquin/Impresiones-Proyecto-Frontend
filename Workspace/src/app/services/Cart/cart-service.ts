import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import CartWithItemsResponse from '../../models/Cart/cartWithItemsResponse';
import OrderItemResponse from '../../models/OrderItem/orderItemResponse';
import Page from '../../models/PageModel/page';
import CartResponse from '../../models/Cart/cartResponse';
import OrderItemCreateRequest from '../../models/OrderItem/orderItemCreateRequest';
import CartStatusUpdateRequest from '../../models/Cart/cartStatusUpdateRequest';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/carts`;

  constructor(private http: HttpClient) {}

  createCart(): Observable<CartResponse> {
    return this.http.post<CartResponse>(this.apiUrl, {});
  }

  getMyCart(): Observable<CartWithItemsResponse> {
    return this.http.get<CartWithItemsResponse>(`${this.apiUrl}/my-cart`);
  }

  agregarItem(request: OrderItemCreateRequest, file: File): Observable<OrderItemResponse> {
    const formData = new FormData();

    formData.append('data', JSON.stringify(request));
    formData.append('file', file);

    return this.http.patch<OrderItemResponse>(`${this.apiUrl}/items/agregar-orden`, formData);
  }

  eliminarItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`);
  }

  getPendingCarts(page: number = 0, size: number = 20): Observable<Page<CartResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/pending`, { params });
  }

  actualizarEstado(cartId: string, request: CartStatusUpdateRequest): Observable<CartResponse> {
    return this.http.patch<CartResponse>(`${this.apiUrl}/${cartId}/estado`, { status: request });
  }

  descargarArchivo(cartId: string, ordenId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${cartId}/ordenes/${ordenId}/descargar`, {
      responseType: 'blob',
    });
  }

  filterCarts(filters: any, page: number = 0): Observable<Page<CartResponse>> {
    let params = new HttpParams().set('page', page);

    // Iteramos los filtros para agregarlos a la URL
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/filter`, { params });
  }

  getAll(page: number = 0, size: number = 20): Observable<Page<CartResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CartResponse>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/${id}`);
  }

  getCartItems(cartId: string): Observable<CartWithItemsResponse> {
    return this.http.get<CartWithItemsResponse>(`${this.apiUrl}/${cartId}/items`);
  }

  getOrdersByCart(cartId: string): Observable<OrderItemResponse[]> {
    return this.http.get<OrderItemResponse[]>(`${this.apiUrl}/${cartId}/ordenes`);
  }

  getOrderByCartAndId(cartId: string, orderId: string): Observable<OrderItemResponse> {
    return this.http.get<OrderItemResponse>(`${this.apiUrl}/${cartId}/ordenes/${orderId}`);
  }

  getDeliveredCarts(
    date?: string,
    dateType?: string,
    page: number = 0,
  ): Observable<Page<CartResponse>> {
    let params = new HttpParams().set('page', page);
    if (date) params = params.set('date', date);
    if (dateType) params = params.set('dateType', dateType);
    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/delivered`, { params });
  }
}
