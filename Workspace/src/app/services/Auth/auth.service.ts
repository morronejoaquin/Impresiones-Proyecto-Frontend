import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import LoginRequest from '../../models/Auth/loginRequest';
import { Observable, tap } from 'rxjs';
import AuthResponse from '../../models/Auth/authResponse';
import RegisterRequest from '../../models/Auth/registerRequest';
import RegisterResponse from '../../models/Auth/registerResponse';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { NotificationService } from '../Notification/notification-service';
import { UserService } from '../Users/user-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private notificationService: NotificationService,
    private userService: UserService
  ){
    this.checkAndInitNotifications();
  }

  private checkAndInitNotifications() {
    if (this.getToken()) {
      this.userService.getProfile().subscribe({
        next: (user) => this.notificationService.initPolling(user.role),
        error: () => this.notificationService.clearAndStop()
      });
    }
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        setTimeout(() => {
          this.checkAndInitNotifications();
        }, 500);
      })
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.checkAndInitNotifications();
      })
    );
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken); // Guardamos el nuevo access
        localStorage.setItem('refreshToken', res.refreshToken); // Guardamos el nuevo refresh
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

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    this.router.navigate(['/user-login']);
    
    window.location.reload();
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

}
