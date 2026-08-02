import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import ProfileResponse from '../../../models/Users/profileResponse';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../services/Notification/notification-service';

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
  isLoading = true;
  isEditing = false;
  isSaving = false;
  errorType: 'NONE' | 'CONNECTION' = 'NONE';

  constructor(
    public userService: UserService, 
    private fb: FormBuilder, 
    private router: Router, 
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      surname: ['', [Validators.required, Validators.maxLength(30)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.maxLength(15)]],
      notificationsEnabled: [false]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.userForm.get('notificationsEnabled')?.disable();
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

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}