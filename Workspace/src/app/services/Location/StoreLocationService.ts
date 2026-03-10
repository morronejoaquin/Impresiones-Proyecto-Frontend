import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreLocationService {
  private apiUrl = `${environment.apiUrl}/store`;

  constructor(private http: HttpClient) {}

  getLocation() {
    return this.http.get<any>(`${this.apiUrl}/location`);
  }
}
