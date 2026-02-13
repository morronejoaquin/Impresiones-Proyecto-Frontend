
// ---- Tipos ----
export type AppRole = 'administrador' | 'cliente';

export interface TokenPayload {
  sub: string;      // En JWT estándar 'sub' suele ser el email/username
  roles: string[]; 
  iat: number;
  exp: number;
}

function b64UrlDecode<T = unknown>(b64url: string): T {
  const pad = b64url.length % 4 === 0 ? '' : '='.repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return JSON.parse(atob(b64)) as T;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = b64UrlDecode<TokenPayload>(parts[1]);
    
    // Validar expiración (exp está en segundos, Date.now() en ms)
    if (payload.exp * 1000 < Date.now()) return null;
    
    return payload;
  } catch {
    return null;
  }
}
