import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import Page from '../../models/PageModel/page';
import OrderItemResponse from '../../models/OrderItem/orderItemResponse';
import OrderItemUpdateRequest from '../../models/OrderItem/orderItemUpdateRequest';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  private apiUrl = `${environment.apiUrl}/orderItems`;

  constructor(private http: HttpClient){
  }

  getAll(page: number = 0, size: number = 20): Observable<Page<OrderItemResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<OrderItemResponse>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<OrderItemResponse> {
    return this.http.get<OrderItemResponse>(`${this.apiUrl}/${id}`);
  }

  update(id: string, request: OrderItemUpdateRequest): Observable<OrderItemResponse> {
    return this.http.patch<OrderItemResponse>(`${this.apiUrl}/${id}`, request);
  }
}
