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

  showPassword = false;
  showPasswordConfirm = false;

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  };

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmVisibility() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      surname: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(15)]], 
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(18), Validators.pattern(/^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[@$!%*?&])[A-Za-zñA-ZÑ\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', Validators.required],
      notificationsEnabled: [true]
    }, { validators: this.passwordMatchValidator });
  }

  passwordRequirements = [
    { label: 'Al menos 8 caracteres', regex: /.{8,}/ },
    { label: 'Máximo 18 caracteres', regex: /^.{1,18}$/ },
    { label: 'Una mayúscula', regex: /[A-ZÑ]/ },
    { label: 'Una minúscula', regex: /[a-zñ]/ },
    { label: 'Un número', regex: /\d/ },
    { label: 'Un símbolo (@$!%*?&)', regex: /[@$!%*?&]/ }
  ];

  isRequirementMet(regex: RegExp): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return regex.test(password);
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
        if (error?.status === 400){
          const data = error.error;
          this.errorMessage = data.mensaje || data.error || data.message || "El email ya está registrado";
        } else {
          this.errorMessage = "No se pudo hacer el registro. Inténtelo más tarde."
        }
      }
    });
  }
}
