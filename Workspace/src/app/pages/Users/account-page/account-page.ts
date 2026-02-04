import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/userResponse';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPage implements OnInit {
  currentUser: User | null = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    const payload = this.userService.getDecodedUserPayload();

    if (payload) {
        this.userService.getUserById(payload.userId).subscribe({
            next: (user: User) => {this.currentUser = user;},
            error: (err) => {console.error('Error al cargar datos del usuario:', err);
              this.userService.logout();
              this.router.navigate(['/user-login']);
            }
          });
    } else {
      this.router.navigate(['/user-login']);
    }
  }

  logout() {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.userService.logout();
      this.router.navigate(['/']);
    }
  }

  editProfile(): void {
    this.router.navigate(['/user-edit']);
  }
}