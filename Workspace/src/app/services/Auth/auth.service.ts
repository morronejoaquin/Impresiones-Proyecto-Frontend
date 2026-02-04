import { Injectable, signal } from '@angular/core';
import User from '../../models/Users/userResponse';
import { encodeToken, saveToken, readToken, clearToken, decodeToken } from '../../utils/jwt-utils';

type SafeUser = Omit<User, 'password'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<SafeUser | null>(null);

  constructor() { this.restore(); }

  login(user: User) {
    const token = encodeToken(user); 
    saveToken(token);                
    this.restore();                  
  }

  restore() {
    const token = readToken();
    const payload = token ? decodeToken(token) : null;
    if (!payload) { this.currentUser.set(null); return; }

    this.currentUser.set({
      id: payload.userId,
      username: payload.username,
      name: payload.username,
      surname: '',
      email: `${payload.username}@example.com`,
      role: payload.role,
      phone: ''
    } as SafeUser);
  }

  logout() {
    clearToken();
    this.currentUser.set(null);
  }

  get role(): SafeUser['role'] | null { return this.currentUser()?.role ?? null; }
  get isLoggedIn(): boolean { return !!this.currentUser(); }
}
