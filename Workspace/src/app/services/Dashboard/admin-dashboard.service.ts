import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import AdminDashboardResponse from '../../models/Dashboard/adminDashboardResponse';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) {
  }

  getDashboardData(filters?: any): Observable<AdminDashboardResponse>{
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/dashboard`, {params});
  }

}
