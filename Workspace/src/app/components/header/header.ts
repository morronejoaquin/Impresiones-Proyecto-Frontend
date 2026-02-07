import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';   
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/Users/user-service'; 
import { AuthService } from '../../services/Auth/auth.service';
import { NotificationService } from '../../services/Notification/notification-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'] 
})
export class Header {
  
  constructor(private auth: AuthService, private notificationService: NotificationService){
  }

  logout() {
    this.auth.logout();
  }
}
