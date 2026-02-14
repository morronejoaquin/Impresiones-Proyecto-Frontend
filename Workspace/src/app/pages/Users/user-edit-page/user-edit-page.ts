import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import { NotificationService } from '../../../services/Notification/notification-service';
import ProfileResponse from '../../../models/Users/profileResponse';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit-page.html',
  styleUrl: './user-edit-page.css'
})
export class UserEditPage implements OnInit {
  userForm: FormGroup;
  currentUser: ProfileResponse | null = null;
  isLoading = true;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notification: NotificationService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;

    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.currentUser = profile;
        this.userForm.patchValue({
          name: profile.name,
          surname: profile.surname,
          email: profile.email,
          phone: profile.phone
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar perfil:', err);
        if (err?.status === 401 || err?.status === 403) {
          this.router.navigate(['/login']);
        } else {
          this.notification.error('Error al cargar tu perfil.');
        }
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos.');
      return;
    }

    this.isSaving = true;

    const updateRequest = {
      name: this.userForm.get('name')?.value,
      surname: this.userForm.get('surname')?.value,
      phone: this.userForm.get('phone')?.value
    };

    this.userService.updateProfile(updateRequest).subscribe({
      next: () => {
        this.isSaving = false;
        this.notification.success('Perfil actualizado correctamente.');
        setTimeout(() => this.router.navigate(['/account']), 1500);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error al actualizar perfil:', err);
        if (err?.status === 400) {
          this.notification.error('Datos inválidos. Verifica los campos.');
        } else {
          this.notification.error('Error al actualizar tu perfil. Intenta nuevamente.');
        }
      }
    });
  }

  onCancel(): void {
    if (this.userForm.dirty) {
      if (confirm('¿Estás seguro de que quieres descartar los cambios?')) {
        this.router.navigate(['/account']);
      }
    } else {
      this.router.navigate(['/account']);
    }
  }
}
