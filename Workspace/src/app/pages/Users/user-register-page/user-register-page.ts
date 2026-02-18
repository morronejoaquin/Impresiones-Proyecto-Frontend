import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-user-register-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-register-page.html',
  styleUrl: './user-register-page.css'
})
export class UserRegisterPage implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], 
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(18), Validators.pattern(/^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[@$!%*?&])[A-Za-zñA-ZÑ\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  onRegisterSubmit() {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.authService.register(this.registerForm.value).subscribe({
      next: (data) => {
        console.log('Registro exitoso');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        if (error.status === 409 || error.error?.message?.includes('email')) {
          this.errorMessage = "Este correo electrónico ya se encuentra registrado";
        } else {
          this.errorMessage = "Ocurrió un error inesperado. Inténtalo más tarde.";
        }
      }
    });
  }
}
