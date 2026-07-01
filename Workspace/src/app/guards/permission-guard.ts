import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { decodeToken } from '../utils/jwt-utils';

const LOGIN_URL = '/user-login';

export const permissionGuard: CanActivateFn = (route): boolean | UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) return router.createUrlTree(['/user-login']);

  const payload = decodeToken(token);
  if (!payload || !payload.roles) {
    return router.createUrlTree(['/user-login']);
  }

  // 1. Obtener roles permitidos de la ruta
  const allowedRoles = route.data?.['allowedRoles'] as string[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) return true;

  // 2. Limpiar los roles que vienen del Token (quitar 'ROLE_' si existe)
  const userRoles = payload.roles.map(role => role.replace('ROLE_', '').toLowerCase());
  
  // 3. Normalizar los roles permitidos de la ruta a minúsculas
  const requiredRoles = allowedRoles.map(r => r.toLowerCase());

  const hasPermission = userRoles.some(role => requiredRoles.includes(role));

  if (hasPermission) {
    return true;
  } else {
    console.warn('Acceso denegado: el usuario no tiene los roles necesarios.');
    // Si el usuario está logueado pero no tiene permiso, va a HOME, no al LOGIN
    return router.createUrlTree(['/home']);
  }
};
