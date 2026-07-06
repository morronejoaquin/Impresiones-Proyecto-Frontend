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
  }

  private checkAndInitNotifications() {
    if (this.getToken()) {
      // detiene cualquier polling previo antes de empezar uno nuevo
      this.notificationService.clearAndStop();

      this.userService.getProfile().subscribe({
        next: (user) => {
          this.notificationService.initPolling(user.role)},
        error: () => {
          this.notificationService.clearAndStop()}
      });
    }
  }

  public initAppSession(): void {
    // Solo se dispara la carga una vez al inicio
    this.userService.loadProfile();
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.checkAndInitNotifications();
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
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }

  logout(): void {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post(`${this.apiUrl}/logout`, {}, {headers}).subscribe({
      next: () => this.cleanStorageAndRedirect(),
      error: () => this.cleanStorageAndRedirect()
    });
  }

  public cleanStorageAndRedirect(): void {

    // se detienen las notificaciones
    this.notificationService.clearAndStop();

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    this.router.navigate(['/user-login']);
    
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

}
