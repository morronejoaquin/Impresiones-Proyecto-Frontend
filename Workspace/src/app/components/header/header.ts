import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';   
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/Users/user-service'; 
import { AuthService } from '../../services/Auth/auth.service';
import { NotificationDropdown } from '../notification-dropdown/notification-dropdown';
import { filter } from 'rxjs';
import ProfileResponse from '../../models/Users/profileResponse';

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
  user: ProfileResponse | null = null;
  
  constructor(public authService: AuthService, public userService: UserService, private router: Router){
  }

  ngOnInit(): void {
    this.userService.profile$.subscribe(profile => {
      this.user = profile;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileOpen = false;
      this.showUserMenu = false;
    });
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
