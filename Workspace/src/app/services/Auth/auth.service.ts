import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import LoginRequest from '../../models/Auth/loginRequest';
import { Observable, tap } from 'rxjs';
import AuthResponse from '../../models/Auth/authResponse';
import RegisterRequest from '../../models/Auth/registerRequest';
import RegisterResponse from '../../models/Auth/registerResponse';
import UserResponse from '../../models/Users/userResponse';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { NotificationService } from '../Notification/notification-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `http://localhost:8080/auth`;

  constructor(private http: HttpClient, private router: Router, private notificationService: NotificationService){
    if(this.getToken()){
      this.notificationService.initPolling();
    }
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        setTimeout(() => {
          this.notificationService.initPolling();
        }, 500);
      })
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(res => {
        localStorage.setItem('token', res.token)
        this.notificationService.initPolling();
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.cleanStorageAndRedirect(),
      error: () => this.cleanStorageAndRedirect()
    });
  }

  private cleanStorageAndRedirect(): void {

    // se detienen las notificaciones
    this.notificationService.clearAndStop();

    localStorage.removeItem('token');

    this.router.navigate(['/user-login']);
    
    window.location.reload();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
