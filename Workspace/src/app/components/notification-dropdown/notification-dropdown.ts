import { Component, HostListener, OnInit } from '@angular/core';
import NotificationResponse from '../../models/NotificationModel/notificationResponse';
import { NotificationService } from '../../services/Notification/notification-service';
import { Router } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-dropdown',
  imports: [CommonModule, AsyncPipe],
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

  handleNotificationClick(notif: NotificationResponse) {
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        this.isOpen = false;
        this.router.navigate(['/my-orders']);
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsReadServer().subscribe({
      next: () => (this.isOpen = false),
      error: (err) => console.error("No se pudo limpiar", err)
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.isOpen = false;
    }
  }

}
