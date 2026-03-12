import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import CartWithItemsResponse from '../../models/Cart/cartWithItemsResponse';
import OrderItemResponse from '../../models/OrderItem/orderItemResponse';
import Page from '../../models/PageModel/page';
import CartResponse from '../../models/Cart/cartResponse';
import OrderItemCreateRequest from '../../models/OrderItem/orderItemCreateRequest';
import CartStatusUpdateRequest from '../../models/Cart/cartStatusUpdateRequest';
import CartHistoryResponse from '../../models/Cart/cartHistoryResponse';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/carts`;
  private cartUpdatedSubject = new Subject<CartWithItemsResponse | null>();
  public cartUpdated$ = this.cartUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  createCart(): Observable<CartResponse> {
    return this.http.post<CartResponse>(this.apiUrl, {});
  }

  getMyCart(): Observable<CartWithItemsResponse> {
    return new Observable((observer) => {
      this.http.get<CartWithItemsResponse>(`${this.apiUrl}/my-cart`).subscribe({
        next: (cart) => {
          this.cartUpdatedSubject.next(cart);
          observer.next(cart);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  agregarItem(request: OrderItemCreateRequest, file: File): Observable<OrderItemResponse> {
    const formData = new FormData();

    formData.append('data', JSON.stringify(request));
    formData.append('file', file);

    return new Observable((observer) => {
      this.http.patch<OrderItemResponse>(`${this.apiUrl}/items/agregar-orden`, formData).subscribe({
        next: (response) => {
          this.refreshCart();
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  eliminarItem(itemId: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`, {
      responseType: 'text' 
    }).pipe(
      tap(() => this.refreshCart())
    );
  }

  getPendingCarts(page: number = 0, size: number = 20): Observable<Page<CartResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/pending`, { params });
  }

  actualizarEstado(cartId: string, request: CartStatusUpdateRequest): Observable<CartResponse> {
    return this.http.patch<CartResponse>(`${this.apiUrl}/${cartId}/estado`, request).pipe(
      tap(() => this.refreshCart())
    );
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

  getMyOrders(page: number = 0, size: number = 20): Observable<Page<CartHistoryResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CartHistoryResponse>>(`${this.apiUrl}/my-orders`, { params });
  }

  cancelOrder(cartId: string) {
    return this.http.patch(`${this.apiUrl}/cancel-order/${cartId}`, {}, {
      responseType: 'text'
    });
  }

  public refreshCart(): void {
    this.http.get<CartWithItemsResponse>(`${this.apiUrl}/my-cart`).subscribe({
      next: (cart) => {
        this.cartUpdatedSubject.next(cart);
      },
      error: (err) => {
        console.error('Error refreshing cart:', err);
      },
    });
  }

  getActiveCartsForAdmin(page: number = 0, size: number = 20): Observable<Page<CartResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/admin/orders`, { params });
  }

  filterCartsForAdmin(filters: any, page: number = 0, size: number = 20): Observable<Page<CartResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters.customerEmail) {
      params = params.set('customerEmail', filters.customerEmail);
    }

    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/admin/filter`, { params });
  }

  getDeliveredHistory(filters: any, page: number = 0, size: number = 20): Observable<Page<CartResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters.customerEmail) {
      params = params.set('customerEmail', filters.customerEmail);
    }

    return this.http.get<Page<CartResponse>>(`${this.apiUrl}/admin/history`, { params });
  }
}
