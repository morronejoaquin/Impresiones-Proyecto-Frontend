import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/Auth/auth.service';
import ProfileResponse from '../../../models/Users/profileResponse';
import { UserService } from '../../../services/Users/user-service';
import { NotificationService } from '../../../services/Notification/notification-service';

@Component({
  selector: 'app-user-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './user-login-page.html',
  styleUrls: ['./user-login-page.css']
})
export class UserLoginPage {
  formUser: FormGroup;
  errorMessage: string | null = null;
  user: ProfileResponse | null = null;

  showPassword = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formUser = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  verificarLogin() {
    if (this.formUser.invalid) {
      console.log('Formulario no válido');
      this.formUser.markAllAsTouched();
      return;
    }

    const credentials = this.formUser.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.handleLogin(response.accessToken);
      }, 
      error: (err) =>{
        if (err?.status === 401) {
          this.errorMessage = "Email o contraseña incorrectos";
        } else {
          this.errorMessage = "No se pudo iniciar sesión. Inténtelo más tarde.";
        }
        console.error(err);
      }
    })
  }

  
  private handleLogin(token: string) {

    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        
        console.log(`Login exitoso como ${this.user.role}`);

        if (this.user.role === 'ADMIN' || this.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']); 
        }
      },
      error: (err) => {
        console.error("No se pudo obtener el perfil tras el login", err);
        this.router.navigate(['/home']);
      }
    });
  }
}
