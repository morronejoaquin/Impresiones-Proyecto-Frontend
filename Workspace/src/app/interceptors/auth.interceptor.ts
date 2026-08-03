import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { NotificationService } from '../services/Notification/notification-service';
import { ApiError } from '../models/Error/apiError';
import { AuthService } from '../services/Auth/auth.service';
import { UserService } from '../services/Users/user-service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(NotificationService);
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // 1. Identifica si la petición es para login o registro
  const isAuthLoginOrRegister = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register');
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  let authReq = req;

  // 2. Solo añade el token si es una petición a nuestra API Y no es de login o registro
  if (token && isApiRequest && !isAuthLoginOrRegister) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 3. Si es una petición de autenticación (login/registro), no se maneja acá
      if (isAuthLoginOrRegister) {
        return throwError(() => error);
      }

      // 4. Manejo de token expirado (401) para el resto de peticiones protegidas
      if (error.status === 401 && refreshToken) {
        return handle401Error(req, next, authService, userService, refreshToken);
      }
      
      // 5. Extracción de error
      let message = 'Ocurrió un error inesperado.';
      let errorBody = error.error;

      if (errorBody) {
        // Si por alguna razón el body viene como un string que contiene JSON plano, intentamos parsearlo
        if (typeof errorBody === 'string') {
          try {
            errorBody = JSON.parse(errorBody);
          } catch (e) {
            // Si no es un JSON válido, asumimos que es el mensaje de texto plano directamente
            message = errorBody;
          }
        }

        // Si ya es un objeto (o se pudo parsear), extraemos el texto limpio priorizando 'mensaje'
        if (typeof errorBody === 'object' && errorBody !== null) {
          message = errorBody.mensaje || errorBody.error || errorBody.message || message;
        }
      }
      
        switch (error.status) {
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
function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: any, userService: any, refreshToken: string): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken(refreshToken).pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(res.accessToken);
        return userService.getProfile().pipe(
            switchMap(() => next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } })))
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        // Si el refresh falla, es que el usuario realmente debe loguearse de nuevo
        authService.cleanStorageAndRedirect();
        return throwError(() => err);
      })
    );
  } else {
    // Si ya se está refrescando, espera el nuevo token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
    );
  }
}