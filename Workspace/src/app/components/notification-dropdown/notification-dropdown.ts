import { Component, HostListener, OnInit } from '@angular/core';
import NotificationResponse from '../../models/NotificationModel/notificationResponse';
import { NotificationService } from '../../services/Notification/notification-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-dropdown',
  imports: [],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.css'
})
export class NotificationDropdown implements OnInit{
  isOpen = false;
  notifications: NotificationResponse[] = [];

  constructor(
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Escuchamos las notificaciones que el Polling recupera
    this.notificationService.unreadNotifications$.subscribe(data => {
      this.notifications = data;
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  handleNotificationClick(notif: any) {
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      this.isOpen = false;
      this.router.navigate(['/my-orders']);
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    // Cerrar si se hace clic fuera del componente
    if (!(event.target as HTMLElement).closest('.notification-container')) {
      this.isOpen = false;
    }
  }

}
