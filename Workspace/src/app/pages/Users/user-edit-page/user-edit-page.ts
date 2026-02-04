import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/userResponse';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit-page.html',
  styleUrl: './user-edit-page.css'
})
export class UserEditPage implements OnInit {
  userForm: FormGroup;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      id: [''],
      username: [''],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: [
        '',
        [
          Validators.minLength(6), 
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/)
        ],
      ]
    });
  }

  ngOnInit(): void {
    const payload = this.userService.getDecodedUserPayload();
    if (payload) {
      this.userService.getUserById(payload.userId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.userForm.patchValue(user);
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
          this.router.navigate(['/user-login']);
        }
      });
    } else {
      this.router.navigate(['/user-login']);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && this.currentUser) {
      const formValue = this.userForm.getRawValue();

      if (!formValue.password) {
        delete formValue.password;
      }

      const updatedUser = { ...this.currentUser, ...formValue };

      this.userService.updateUser(updatedUser).subscribe({
        next: () => this.router.navigate(['/account']),
        error: (err) => console.error('Error updating user:', err)
      });
    }
  }

  onCancel(): void {
    if (this.userForm.dirty) {
      if (confirm('¿Estás seguro de que quieres descartar los cambios?')) this.router.navigate(['/account']);
    } else this.router.navigate(['/account']);
  }
}
