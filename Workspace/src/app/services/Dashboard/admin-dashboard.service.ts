import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderSummaryByStatus } from '../../models/Dashboard/orderSummaryByStatus';
import { PrintingStatistics } from '../../models/Dashboard/printingStatistics';
import { PaymentSummaryByMethod } from '../../models/Dashboard/paymentSummaryByMethod';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getOrdersSummaryByStatus(): Observable<OrderSummaryByStatus[]> {
    return this.http.get<OrderSummaryByStatus[]>(`${this.apiUrl}/ordersByStatus`);
  }

  getPrintingStatistics(): Observable<PrintingStatistics> {
    return this.http.get<PrintingStatistics>(`${this.apiUrl}/printingStatistics`);
  }

  getPaymentSummaryByMethod(): Observable<PaymentSummaryByMethod[]> {
    return this.http.get<PaymentSummaryByMethod[]>(`${this.apiUrl}/paymentSummary`);
  }
}
