import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderSummaryByStatus } from '../../models/Dashboard/orderSummaryByStatus';
import { PrintingStatistics } from '../../models/Dashboard/printingStatistics';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:8080/api/admin/dashboard';

  constructor(private http: HttpClient) { }

  getOrdersSummaryByStatus(): Observable<OrderSummaryByStatus[]> {
    return this.http.get<OrderSummaryByStatus[]>(`${this.apiUrl}/orders-by-status`);
  }

  getPrintingStatistics(): Observable<PrintingStatistics> {
    return this.http.get<PrintingStatistics>(`${this.apiUrl}/printing-statistics`);
  }
}
