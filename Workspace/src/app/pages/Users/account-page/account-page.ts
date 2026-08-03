import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import ProfileResponse from '../../../models/Users/profileResponse';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NotificationService } from '../../../services/Notification/notification-service';
import ChangePasswordRequest from '../../../models/Auth/changePasswordRequest';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPage implements OnInit {
  currentUser: ProfileResponse | null = null;
  userForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  isChangingPassword = false;
  isSavingPassword = false;
  errorType: 'NONE' | 'CONNECTION' = 'NONE';

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  };

  toggleOldPasswordVisibility() { 
    this.showOldPassword = !this.showOldPassword; 
  }

  toggleNewPasswordVisibility() { 
    this.showNewPassword = !this.showNewPassword; 
  }

  toggleConfirmPasswordVisibility() { 
    this.showConfirmPassword = !this.showConfirmPassword; 
  }

  constructor(
    public userService: UserService, 
    private fb: FormBuilder, 
    private router: Router, 
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      surname: ['', [Validators.required, Validators.maxLength(30)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(15)]],
      notificationsEnabled: [false]
    });
    
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(18), 
        Validators.pattern(/^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[@$!%*?&])[A-Za-zñA-ZÑ\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.userForm.get('notificationsEnabled')?.disable();
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
    const password = this.passwordForm.get('newPassword')?.value || '';
    return regex.test(password);
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorType = 'NONE';

    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.currentUser = profile;
        this.userForm.patchValue(profile);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error("No se pudo cargar la información del perfil");
        this.errorType = 'CONNECTION';
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    const notificationControl = this.userForm.get('notificationsEnabled');

    if (this.isEditing) {
      this.userForm.patchValue(this.currentUser!);
      notificationControl?.enable();
    } else {
      this.userForm.patchValue(this.currentUser!);
      notificationControl?.disable();
    }
  }

  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordForm.reset();
  }

  get hasChanges(): boolean {
    if (!this.currentUser) return false;
    
    const formValues = this.userForm.value;
    
    return (
      formValues.name !== this.currentUser.name ||
      formValues.surname !== this.currentUser.surname ||
      formValues.phone !== this.currentUser.phone ||
      formValues.notificationsEnabled !== (this.currentUser as any).notificationsEnabled
    );
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    this.isSaving = true;
    this.userService.updateProfile(this.userForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.loadProfile();
        this.notificationService.success('Perfil actualizado');
      },
      error: (error) => { this.isSaving = false; console.log(error) }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    
    this.isSavingPassword = true;
    const passwordData: ChangePasswordRequest = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.notificationService.success('Contraseña actualizada correctamente');
      },
      error: (err) => {
        this.isSavingPassword = false;
        const errorMsg = err.error?.error || err.error || 'No se pudo actualizar la contraseña';
        this.notificationService.error(errorMsg);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}