import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/Notification/notification-service';
import { ApiError } from '../models/Error/apiError';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(NotificationService);
  const token = localStorage.getItem('token');
  
  // 1. Identificar si la petición es para login o registro
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  let authReq = req;

  // 2. Solo añadir el token si es una petición a nuestra API Y NO es de login/registro
  if (token && isApiRequest && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 3. Si es una petición de autenticación, NO manejar errores aquí.
      // Dejamos que el componente de Login gestione su propio error.
      if (isAuthRequest) {
        return throwError(() => error);
      }
      
      // 4. Extracción de error para otras peticiones (Cart, Profile, etc.)
      const apiError = error.error as ApiError;
      const message = apiError?.mensaje || 'Ocurrió un error inesperado.';

      switch (error.status) {
        case 401:
          toastr.clearAndStop();
          toastr.error('Tu sesión ha expirado, por favor ingresa nuevamente');
          localStorage.removeItem('token');
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
      }
      
      return throwError(() => error);
    })
  );
};