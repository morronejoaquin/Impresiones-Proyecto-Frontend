import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { NotificationService } from '../services/Notification/notification-service';
import { ApiError } from '../models/Error/apiError';
import { AuthService } from '../services/Auth/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(NotificationService);
  const authService = inject(AuthService); // Debes tener acceso al servicio
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // 1. Identifica si la petición es para login o registro
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  let authReq = req;

  // 2. Solo añade el token si es una petición a nuestra API Y no es de login o registro
  if (token && isApiRequest && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401 && refreshToken) {
        return handle401Error(req, next, authService, refreshToken);
      }
      
      // 3. Si es una petición de autenticación, no se maneja aca
      if (isAuthRequest) {
        return throwError(() => error);
      }
      
      // 4. Extracción de error para otras peticiones
      const data = error.error;
      const message = data?.mensaje || data?.error || data?.message || 'Ocurrió un error inesperado.';

      switch (error.status) {
        case 401:
          toastr.clearAndStop();
          toastr.error('Tu sesión ha expirado, por favor ingresa nuevamente');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.navigate(['/login']);
          break;
          
        case 403:
          toastr.error('No tienes permisos suficientes.');
          break;
          
        case 400:
        case 404:
        case 409:
          toastr.error(message);
          break;

        case 500:
          toastr.error('Error interno del servidor.');
          break;
        
        case 0:
          toastr.clearAndStop();
          toastr.error('No se pudo conectar con el servidor. Verifica tu conexión.');
          break;  
      }
      
      return throwError(() => error);
    })
  );
};

// Función auxiliar para manejar el refresco
function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: any, refreshToken: string): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken(refreshToken).pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(res.accessToken);
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
      })
    );
  } else {
    // Si ya se está refrescando, espera a que el subject emita el nuevo token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
    );
  }
}