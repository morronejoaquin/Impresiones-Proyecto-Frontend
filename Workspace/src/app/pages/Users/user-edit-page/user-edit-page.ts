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
    
  }

  onSubmit(): void {
    
  }

  onCancel(): void {
    if (this.userForm.dirty) {
      if (confirm('¿Estás seguro de que quieres descartar los cambios?')) this.router.navigate(['/account']);
    } else this.router.navigate(['/account']);
  }
}
