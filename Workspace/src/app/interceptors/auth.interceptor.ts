import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router); 

  const isApiRequest = req.url.includes('localhost:8080') || req.url.includes(environment.apiUrl);
  
  const isAuthPath = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  let authReq = req;
  if (token && isApiRequest) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthPath) {
        console.warn('Token expirado o inválido. Limpiando sesión...');
        
        localStorage.removeItem('token');
        
        router.navigate(['/home']);
      }
      return throwError(() => error);
    })
  );
};