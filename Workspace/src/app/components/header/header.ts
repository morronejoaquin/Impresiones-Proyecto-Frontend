import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';   
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/Users/user-service'; 
import { AuthService } from '../../services/Auth/auth.service';
import { NotificationDropdown } from '../notification-dropdown/notification-dropdown';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationDropdown],
  templateUrl: './header.html',
  styleUrls: ['./header.css'] 
})
export class Header {
  
  constructor(public auth: AuthService, public userService: UserService){
  }

  logout() {
    this.auth.logout();
  }
}
