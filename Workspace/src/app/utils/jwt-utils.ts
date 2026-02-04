// src/app/utils/jwt-utils.ts
import User from "../models/Users/user";

// ---- Tipos ----
export type AppRole = 'admin' | 'guest' | 'registered';

export interface TokenPayload {
  userId: string;
  username: string;
  role: AppRole;
  iat: number;           // issued at (segundos)
  exp: number;           // expires at (segundos)
}

// ---- Helpers base64 URL-safe (btoa/atob pero URL safe) ----
function b64UrlEncode(obj: unknown): string {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64UrlDecode<T = unknown>(b64url: string): T {
  const pad = b64url.length % 4 === 0 ? '' : '='.repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return JSON.parse(atob(b64)) as T;
}

// ---- Config ----
const DEFAULT_TTL_SEC = 60 * 60; // 1h

// Generar token MOCK (header.payload.signature)
export function encodeToken(user: User, ttlSec: number = DEFAULT_TTL_SEC): string {
  const header = { alg: 'none', typ: 'JWT' }; // MOCK: sin firma
  const now = Math.floor(Date.now() / 1000);

  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role as AppRole,
    iat: now,
    exp: now + ttlSec,
  };

  const h = b64UrlEncode(header);
  const p = b64UrlEncode(payload);
  return `${h}.${p}.MOCK_SIGNATURE`;
}

// Decodificar/validar token (solo payload)
export function decodeToken(token: string): TokenPayload | null {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;

    const payload = b64UrlDecode<TokenPayload>(p);

    if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return null;
    if (payload.exp * 1000 < Date.now()) {
      console.warn('Token expirado (MOCK)');
      return null;
    }
    return payload;
  } catch (err) {
    console.error('Token inválido (MOCK):', err);
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  return !!decodeToken(token);
}

// ---- Helpers de uso común ----
export function getUserId(token: string): string | null {
  return decodeToken(token)?.userId ?? null;
}

export function getRole(token: string): AppRole | null {
  return decodeToken(token)?.role ?? null;
}

export function hasRole(token: string, ...roles: AppRole[]): boolean {
  const r = getRole(token);
  return !!r && roles.includes(r);
}

export function getAuthHeader(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---- Helpers de storage (opcional) ----
const TOKEN_KEY = 'auth_token';

export function saveToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function readToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
