import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './user-login-page.html',
  styleUrls: ['./user-login-page.css']
})
export class UserLoginPage implements OnInit {

  formUser: FormGroup;

  constructor(
    private userS: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formUser = this.fb.group({
      usernameF: ['', Validators.required],
      passwordF: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  private cargarUsuarios() {
    this.userS.getUsers().subscribe({
      next: (data) => { this.userS.User = data; },
      error: (e) => console.error(e)
    });
  }

  verificarLogin() {
    if (this.formUser.invalid) {
      console.log('Formulario no válido');
      this.formUser.markAllAsTouched();
      return;
    }

    const username = this.formUser.get('usernameF')!.value as string;
    const password = this.formUser.get('passwordF')!.value as string;

    const usuarioEncontrado = this.userS.User.find(
      (u: User) => u.username === username && u.password === password
    );

    if (!usuarioEncontrado) {
      console.log('Credenciales incorrectas');
      return;
    }

    this.handleLogin(usuarioEncontrado);
  }

  loginAsGuest() {
    const guestUser: User = {
      id: `${Date.now()}`,
      username: `guest_${Date.now()}`,
      name: 'Invitado',
      surname: 'Temporal',
      email: 'guest@temp.com',
      phone: '0000000000',
      password: '',
      role: 'guest',
    };

    this.userS.postUser(guestUser).subscribe({
      next: (created: User) => {
        console.log('Usuario invitado creado:', created);
        this.userS.setGuestUserForCleanup(created);
        this.handleLogin(created);
      },
      error: (err) => console.error('Error al crear invitado:', err)
    });
  }

  private handleLogin(user: User) {
    this.userS.setAuthToken(user); 

    if (!this.userS.isLoggedIn()) {
      console.warn('No se pudo establecer sesión (token inválido).');
      return;
    }

    console.log(`Login exitoso como ${user.role}`);

    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/make-order']); 
    }
  }
}
