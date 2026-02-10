import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/Auth/auth.service';
import UserResponse from '../../../models/Users/userResponse';

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
  user: UserResponse | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formUser = this.fb.group({
      usernameF: ['', Validators.required, Validators.email],
      passwordF: ['', Validators.required]
    });
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
        this.handleLogin(response.token);
      }, 
      error: (err) =>{
        this.errorMessage = "Email o contraseña incorrectos";
        console.error(err);
      }
    })
  }

  
  private handleLogin(token: string) {
    localStorage.setItem('token', token); 

    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error(err);
      }
    })

    console.log(`Login exitoso como ${this.user?.role}`);

    if (this.user?.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']); 
    }
  }
}
