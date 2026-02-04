import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { readToken } from '../utils/jwt-utils';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = readToken();
  
  if (token && req.url.includes('localhost:8080')) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }
  
  return next(req);
};