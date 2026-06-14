import { Component } from '@angular/core';
import { ImpresionesNotification, NotificationService } from '../../../services/Notification/notification-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-display',
  imports: [CommonModule],
  templateUrl: './notification-display.html',
  styleUrl: './notification-display.css'
})
export class NotificationDisplay {
  currentNotification: ImpresionesNotification | null = null;

  isVisible: boolean = false; 

  constructor(
    private notificationService: NotificationService,
    private router: Router 
  ) {
  }

  ngOnInit() {
    const pending = this.notificationService.getPendingNotification();
    if (pending) {
      this.displayNotification(pending);
    }

    this.notificationService.notification$.subscribe(notification => {
      if (!this.currentNotification) {
        this.displayNotification(notification);
      }
    });
  }

  private displayNotification(notification: ImpresionesNotification): void {
    this.currentNotification = notification;
    this.isVisible = false; 

    setTimeout(() => {
        this.isVisible = true;
    }, 50);
    
    const redirectUrl = notification.redirectUrl; 

    setTimeout(() => {
        this.isVisible = false; 
        
        setTimeout(() => {
            this.currentNotification = null;

            if (redirectUrl) {
                this.router.navigate([redirectUrl]);
            }
        }, 500); 
    }, 3000); 
  }
}
