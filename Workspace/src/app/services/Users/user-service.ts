import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import User from '../../models/Users/userResponse';
import { decodeToken, encodeToken, isTokenValid } from '../../utils/jwt-utils';
import { CartService } from '../Cart/cart-service';
import { OrderService } from '../Orders/order-service';
import { forkJoin, of, switchMap, tap } from 'rxjs';
import OrderItem from '../../models/OrderItem/orderItemResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  readonly url='http://localhost:3000/users'

  User:User[]=[]

  readonly TOKEN_KEY = 'auth_token'

  private loggedInUser: User | null = null;

  private readonly GUEST_ID_KEY = 'guest_user_id'
  private readonly GUEST_ROLE_KEY = 'guest_user_role'

  constructor(private http:HttpClient, private cartService: CartService, private orderService: OrderService) {
    this.checkPreviousGuestSession()
  }

  getUsers(){
    return this.http.get<User[]>(this.url);
  }

  getUserById(id:string){
    return this.http.get<User>(`${this.url}/${id}`);
  }

  postUser(user:User){
    return this.http.post<User>(this.url,user);
  }

  updateUser(user:User){
    return this.http.put<User>(`${this.url}/${user.id}`,user);
  }

  deleteUser(id:string){
    return this.http.delete<User>(`${this.url}/${id}`);
  }

  setAuthToken(user: User): void {
    const token = encodeToken(user); // Generar el token
    sessionStorage.setItem(this.TOKEN_KEY, token); 
  }

  getAuthToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUserRole(): 'admin' | 'guest' | 'registered' | null {
    const token = this.getAuthToken();
    if (!token || !isTokenValid(token)) {
        this.logout();
        return null;
    }
    
    const decoded = decodeToken(token);
    return decoded?.role as ('admin' | 'guest' | 'registered') || null;
  }

  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  getDecodedUserPayload(): { userId: string, role: 'admin' | 'guest' | 'registered' } | null {
      const token = this.getAuthToken();
      if (!token || !isTokenValid(token)) {
          this.logout();
          return null;
      }
      
      const decoded = decodeToken(token);

      if (decoded && decoded.userId) {
            return decoded as { userId: string, role: 'admin' | 'guest' | 'registered' };
      }
      return null;
  }

  setGuestUserForCleanup(user: User): void {
    if (user.role === 'guest' && user.id) {
      localStorage.setItem(this.GUEST_ID_KEY, user.id.toString());
      localStorage.setItem(this.GUEST_ROLE_KEY, user.role);
    }
  }

  checkPreviousGuestSession(): void {
        const guestId = localStorage.getItem(this.GUEST_ID_KEY);
        const guestRole = localStorage.getItem(this.GUEST_ROLE_KEY);

        if (guestId && guestRole === 'guest') {
            console.log(`[LIMPIEZA] Detectado usuario invitado pendiente: ID ${guestId}`);
            this.logout(); 
            
            this.cartService.getCartByUserId(guestId).subscribe({
                next: (carts) => {
                    if (carts && carts.length > 0) {
                        const cartToDeleteId = carts[0].id;
                        console.log(`[LIMPIEZA] Carrito encontrado para limpiar: ${cartToDeleteId}`);

                        this.orderService.getOrdersFromCart(cartToDeleteId).subscribe({
                            next: (items: OrderItem[]) => {
                                if (items.length > 0) {
                                    console.log(`[LIMPIEZA] Eliminando ${items.length} OrderItems asociados...`);
                                    
                                    const deletePromises = items.map(item => 
                                        this.orderService.deleteOrderFromCart(item.id).toPromise()
                                    );
                                    
                                    Promise.all(deletePromises)
                                        .then(() => {
                                            console.log('[LIMPIEZA] Todos los OrderItems eliminados con éxito.');
                                            
                                            this.deleteCartAndUser(cartToDeleteId, guestId);
                                        })
                                        .catch((e) => {
                                            console.error('[LIMPIEZA] Error eliminando OrderItems:', e);
                                            this.deleteCartAndUser(cartToDeleteId, guestId);
                                        });

                                } else {
                                    console.log('[LIMPIEZA] No hay OrderItems que eliminar.');
                                    this.deleteCartAndUser(cartToDeleteId, guestId);
                                }
                            },
                            error: (e) => console.error('[LIMPIEZA] Error buscando OrderItems:', e)
                        });

                    } else {
                        console.log('[LIMPIEZA] No se encontró carrito, solo se elimina el usuario.');
                        this.deleteUser(guestId).subscribe({
                            complete: () => this.cleanupLocalStorage()
                        });
                    }
                },
                error: (err) => {
                    console.error('[LIMPIEZA] Error al buscar carrito para limpieza:', err);
                }
            });
        }
    }
    
    private deleteCartAndUser(cartId: string, guestId: string): void {
        this.cartService.deleteCart(cartId).subscribe({
            next: () => {
                console.log(`[LIMPIEZA] Carrito ${cartId} eliminado.`);
                
                this.deleteUser(guestId).subscribe({
                    next: () => console.log(`[LIMPIEZA] Usuario invitado ${guestId} eliminado.`),
                    error: (e) => console.error(`[LIMPIEZA] Error eliminando usuario ${guestId}:`, e),
                    complete: () => this.cleanupLocalStorage()
                });
            },
            error: (e) => {
                console.error(`[LIMPIEZA] Error eliminando carrito ${cartId}:`, e);
                this.deleteUser(guestId).subscribe({
                    next: () => console.log(`[LIMPIEZA] Usuario invitado ${guestId} eliminado después de un fallo en carrito.`),
                    error: (e) => console.error(`[LIMPIEZA] Error eliminando usuario ${guestId}:`, e),
                    complete: () => this.cleanupLocalStorage()
                });
            }
        });
    }

    private cleanupLocalStorage(): void {
        console.log('[LIMPIEZA] Limpiando localStorage.');
        localStorage.removeItem(this.GUEST_ID_KEY); 
        localStorage.removeItem(this.GUEST_ROLE_KEY);
    }

loginMock(user: User) {
  this.setAuthToken(user);
  this.setGuestUserForCleanup(user); 
}

isLoggedIn(): boolean {
  const token = this.getAuthToken();
  return !!token && isTokenValid(token);
}

getCurrentRole(): 'admin' | 'guest' | 'registered' | null {
  return this.getUserRole();
}

getCurrentUsername(): string | null {
  const p = this.getDecodedUserPayload();
  return p ? (p as any).username ?? null : null;
}
}
