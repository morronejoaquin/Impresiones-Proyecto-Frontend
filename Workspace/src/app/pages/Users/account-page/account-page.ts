import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import ProfileResponse from '../../../models/Users/profileResponse';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPage implements OnInit {
  currentUser: ProfileResponse | null = null;
  isLoading = true;
  accessDenied = false;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.accessDenied = false;

    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.currentUser = profile;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 401 || err?.status === 403) {
          this.accessDenied = true;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          console.error('Error al cargar perfil:', err);
          this.accessDenied = true;
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  editProfile(): void {
    this.router.navigate(['/user-edit']);
  }
}