import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreLocationService {
  private apiUrl = `http://localhost:8080/store`;

  constructor(private http: HttpClient) {}

  getLocation() {
    return this.http.get<any>(`${this.apiUrl}/location`);
  }
}
