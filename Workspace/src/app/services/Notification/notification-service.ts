import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, retry, share, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import NotificationResponse from '../../models/NotificationModel/notificationResponse';

export interface ImpresionesNotification {
  message: string;
  type: 'success' | 'error' | 'info';
  redirectUrl?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'http://localhost:8080/api/notifications';

  private notificationSubject = new Subject<ImpresionesNotification>();
  notification$ = this.notificationSubject.asObservable();

  private pendingNotification: ImpresionesNotification | null = null;
  
  // Usamos BehaviorSubject para que la campana siempre tenga un valor inicial (0)
  private unreadNotificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
  public unreadNotifications$ = this.unreadNotificationsSubject.asObservable();
  
  // Un observable derivado solo para el conteo (facilita el Badge del HTML)
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private stopPolling$ = new Subject<void>();

  constructor(private http: HttpClient){
  }

  public initPolling() {
    // timer(retraso inicial, cada cuánto tiempo)
    // 30000 ms = 30 segundos
    timer(0, 30000).pipe(
      takeUntil(this.stopPolling$),
      switchMap(() => this.getUnreadFromServer()),
      retry({ count: 3, delay: 5000 }), // Si hay un error de red, no rompe el polling, intenta en el próximo ciclo
      share()  // Evita múltiples peticiones si hay varios componentes suscritos
    ).subscribe({
        next: notifications => {
          this.unreadNotificationsSubject.next(notifications);
          this.unreadCountSubject.next(notifications.length);
        },
        error: (e) => console.error("Error en polling", e)
    });
  }

  public clearAndStop() {
    this.stopPolling$.next(); // Detiene el timer definitivamente
    this.unreadNotificationsSubject.next([]); // Limpia la lista (Criterio de aceptación)
    this.unreadCountSubject.next(0); // Limpia el contador
    this.pendingNotification = null;
  }

  private getUnreadFromServer(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.API_URL}/unread`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/read`, {}).pipe(
      tap(() => {
        // Actualizamos el estado local inmediatamente para mejorar la UX
        const updatedList = this.unreadNotificationsSubject.value.filter(n => n.id !== id);
        this.unreadNotificationsSubject.next(updatedList);
        this.unreadCountSubject.next(updatedList.length);
      })
    );
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info', redirectUrl?: string) {
    const notification: ImpresionesNotification = { message, type, redirectUrl }; 

    // Almacena el mensaje 
    this.pendingNotification = notification;

    this.notificationSubject.next(notification);
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
