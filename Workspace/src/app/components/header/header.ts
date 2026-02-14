import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';   
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/Users/user-service'; 
import { AuthService } from '../../services/Auth/auth.service';
import { NotificationDropdown } from '../notification-dropdown/notification-dropdown';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationDropdown],
  templateUrl: './header.html',
  styleUrls: ['./header.css'] 
})
export class Header implements OnInit{
  isMobileOpen = false;
  showUserMenu = false;
  
  constructor(public authService: AuthService, public userService: UserService){
  }

  ngOnInit(): void {
    this.userService.loadProfile();
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.isMobileOpen = false;
    this.showUserMenu = false;
  }
}
