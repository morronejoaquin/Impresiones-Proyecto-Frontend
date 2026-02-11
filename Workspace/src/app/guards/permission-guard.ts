import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { decodeToken } from '../utils/jwt-utils';

const LOGIN_URL = '/user-login';

export const permissionGuard: CanActivateFn = (route): boolean | UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    return router.createUrlTree([LOGIN_URL]);
  }

  const payload = decodeToken(token);

  // Si el token es inválido o expiró
  if (!payload) {
    localStorage.removeItem('token');
    return router.createUrlTree([LOGIN_URL]);
  }

  // Roles requeridos por la ruta (definidos en app-routing.module.ts)
  const allowedRoles = route.data?.['allowedRoles'] as string[] | undefined;

  // Si la ruta no tiene restricciones de rol, basta con estar autenticado
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Verificamos si alguno de los roles del token coincide con los permitidos
  const hasPermission = payload.role.some(role => allowedRoles.includes(role));

  return hasPermission 
    ? true 
    : router.createUrlTree([LOGIN_URL]);
};
