import { Injectable } from '@angular/core';
import PaymentHistoryResponse from '../../models/Payment/paymentHistoryResponse';
import PaymentResponse from '../../models/Payment/paymentResponse';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import Page from '../../models/PageModel/page';
import PaymentCreateRequest from '../../models/Payment/paymentCreateRequest';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient){
  }

  getAll(page: number = 0, size: number = 20): Observable<Page<PaymentHistoryResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<PaymentHistoryResponse>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<PaymentHistoryResponse> {
    return this.http.get<PaymentHistoryResponse>(`${this.apiUrl}/${id}`);
  }

  checkout(request: PaymentCreateRequest): Observable<PaymentResponse>{
    return this.http.post<PaymentResponse>(`${this.apiUrl}/checkout`, request)
  }

  getMyPayments(page: number = 0, size: number = 20, sort: string = 'orderDate,desc'){
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<Page<PaymentHistoryResponse>>(`${this.apiUrl}/my`, { params });
  }
}