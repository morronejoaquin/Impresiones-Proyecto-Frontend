import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth.service';
import { UserService } from '../../../services/Users/user-service';
import { AsyncPipe } from '@angular/common';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit{

  get isAdmin$(): Observable<boolean> {
    return this.userService.profile$.pipe(
      map(profile => profile?.role === 'administrador')
    );
  }

  constructor(public authService: AuthService, public userService: UserService) {
  }

  images = [
    '/assets/imagen-1.jpg',
    '/assets/imagen-2.jpg'
  ];
  
  currentImageIndex = 0;

  ngOnInit(): void {
    if(this.authService.getToken()){
      this.userService.loadProfile();
    }
    this.startImageCycle();
  }

  startImageCycle() {
    setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 10000);
  }
}
