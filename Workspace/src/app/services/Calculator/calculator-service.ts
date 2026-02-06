import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import PriceCalculationResponse from '../../models/Prices/priceCalculationResponse';
import PriceCalculationRequest from '../../models/Prices/priceCalculationRequest';

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  private apiUrl = `${environment.apiUrl}/calculator`;

  constructor(private http: HttpClient) {}

  calculation(request: PriceCalculationRequest):Observable<PriceCalculationResponse> {
    return this.http.post<PriceCalculationResponse>(`${this.apiUrl}/calculate`, request);
  }
}