import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import LoginRequest from '../../models/Auth/loginRequest';
import { Observable, tap } from 'rxjs';
import AuthResponse from '../../models/Auth/authResponse';
import RegisterRequest from '../../models/Auth/registerRequest';
import RegisterResponse from '../../models/Auth/registerResponse';
import UserResponse from '../../models/Users/userResponse';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient){
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  logout(): void {
    const token = localStorage.getItem('token');
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
