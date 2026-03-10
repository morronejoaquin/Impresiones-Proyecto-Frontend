import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, retry, share, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import NotificationResponse from '../../models/NotificationModel/notificationResponse';
import { environment } from '../../../environments/environment';

export interface ImpresionesNotification {
  message: string;
  type: 'success' | 'error' | 'info';
  redirectUrl?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}notifications`;

  private notificationSubject = new Subject<ImpresionesNotification>();
  public notification$ = this.notificationSubject.asObservable();

  private pendingNotification: ImpresionesNotification | null = null;
  
  // 2. Notificaciones persistentes (Dropdown/Campana)
  // IMPORTANTE: Aquí debe ser NotificationResponse[]
  private unreadNotificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
  public unreadNotifications$ = this.unreadNotificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private stopPolling$ = new Subject<void>();
  private isPollingActive = false;

  constructor(private http: HttpClient) {}

  public initPolling(userRole: string) {

    if(this.isPollingActive || userRole !== 'cliente'){
      return;
    }

    this.isPollingActive = true;

    timer(0, 30000).pipe(
      takeUntil(this.stopPolling$),
      switchMap(() => this.getUnreadFromServer().pipe(
        catchError(() => of([])) 
      )),
      retry({ count: 3, delay: 5000 }),
      share()
    ).subscribe(notifications => {
      this.unreadNotificationsSubject.next(notifications);
      this.unreadCountSubject.next(notifications.length);
    });
  }

  public clearAndStop() {
    this.stopPolling$.next();
    this.isPollingActive = false;
    this.unreadNotificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  private getUnreadFromServer(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.API_URL}/unread`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/read`, {}).pipe(
      tap(() => {
        // Usamos .value porque ahora sí es un BehaviorSubject de la lista
        const updatedList = this.unreadNotificationsSubject.value.filter(n => n.id !== id);
        this.updateLocalState(updatedList);
      })
    );
  }
  
  markAllAsReadServer(): Observable<void> {
    // Realiza la petición PATCH al endpoint correspondiente
    return this.http.patch<void>(`${this.API_URL}/mark-all-read`, {}).pipe(
      tap(() => {
        // Limpiamos el estado local inmediatamente para actualizar la UI
        this.unreadNotificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }),
      catchError(err => {
        console.error("Error al marcar todas como leídas en el servidor", err);
        throw err;
      })
    );
  }

  private updateLocalState(newList: NotificationResponse[]) {
    this.unreadNotificationsSubject.next(newList);
    this.unreadCountSubject.next(newList.length);
  }

  // Métodos para Toasts manuales
  show(message: string, type: 'success' | 'error' | 'info' = 'info', redirectUrl?: string) {
    this.notificationSubject.next({ message, type, redirectUrl });
  }

  getPendingNotification(): ImpresionesNotification | null {
    const notification = this.pendingNotification;
    this.pendingNotification = null;
    return notification;
  }

  success(message: string, redirectUrl?: string) {
    this.show(message, 'success', redirectUrl);
  }

  error(message: string, redirectUrl?: string) {
    this.show(message, 'error', redirectUrl);
  }

  info(message: string, redirectUrl?: string) {
    this.show(message, 'info', redirectUrl);
  } 
}
