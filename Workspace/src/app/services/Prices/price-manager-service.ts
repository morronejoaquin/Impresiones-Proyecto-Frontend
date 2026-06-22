import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import Page from '../../models/PageModel/page';
import PricesResponse from '../../models/Prices/pricesResponse';
import pricesUpdateRequest from '../../models/Prices/pricesUpdateRequest';

@Injectable({
  providedIn: 'root'
})
export class PriceManagerService {
  private apiUrl = `${environment.apiUrl}/prices`;

  constructor(private http: HttpClient){
  }

  getAll(page: number = 0, size: number = 20): Observable<Page<PricesResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<PricesResponse>>(this.apiUrl, { params });
  }

  getCurrentPrices(): Observable<PricesResponse> {
    return this.http.get<PricesResponse>(`${this.apiUrl}/current-prices`)
  }

  getById(id: string): Observable<PricesResponse> {
    return this.http.get<PricesResponse>(`${this.apiUrl}/${id}`);
  }

  updatePrices(request: pricesUpdateRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  getPricesHistory(): Observable<PricesResponse[]> {
    return this.http.get<PricesResponse[]>(`${this.apiUrl}/history`);
  }
}
