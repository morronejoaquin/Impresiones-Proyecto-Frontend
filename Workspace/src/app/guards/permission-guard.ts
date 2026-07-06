import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { decodeToken } from '../utils/jwt-utils';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/Auth/auth.service';
import { UserService } from '../services/Users/user-service';

const LOGIN_URL = '/user-login';

export const permissionGuard: CanActivateFn = (route): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const userService = inject(UserService);

  const token = localStorage.getItem('accessToken');
  if (!token) return of(router.createUrlTree(['/user-login']));

  return userService.getProfile().pipe(
    map(profile => {
      // 1. Normalizar profile.role a un array (por si el backend devuelve un solo string)
      const rolesArray = Array.isArray(profile.role) ? profile.role : [profile.role];

      // 2. Limpiar los roles
      const userRoles = rolesArray.map((r: string) => r.replace('ROLE_', '').toLowerCase());
      
      const allowedRoles = route.data?.['allowedRoles'] as string[] | undefined;
      if (!allowedRoles || allowedRoles.length === 0) return true;

      const requiredRoles = allowedRoles.map((r: string) => r.toLowerCase());
      
      return userRoles.some(r => requiredRoles.includes(r)) 
             ? true 
             : router.createUrlTree(['/home']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/user-login']));
    })
  );
};
