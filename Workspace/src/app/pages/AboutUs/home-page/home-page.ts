import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth.service';
import { UserService } from '../../../services/Users/user-service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit{

  isAdmin: boolean = false;

  constructor(public authService: AuthService, public userService: UserService) {
  }

  images = [
    '/assets/imagen-1.jpg',
    '/assets/imagen-2.jpg'
  ];
  
  currentImageIndex = 0;

  howItWorksImages = [
    '/assets/howItWorks-1.png',
    '/assets/howItWorks-2.png',
    '/assets/howItWorks-3.png'
  ]
  
  adminHowItWorksImages = [
    '/assets/admin-1.png',
    '/assets/admin-2.png',
  ]

  currentHowItWorksIndex: number = 0;

  get currentSliderImages() {
    return this.isAdmin ? this.adminHowItWorksImages : this.howItWorksImages;
  }

  ngOnInit(): void {
    if(this.authService.getToken()){
      this.userService.loadProfile();
    }

    this.userService.profile$.subscribe(profile => {
      this.isAdmin = profile?.role === 'administrador';
      this.currentHowItWorksIndex = 0;
    });

    this.startImageCycle();
  }

  startImageCycle() {
    setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 10000);

    setInterval(() => {
      const images = this.currentSliderImages;
      this.currentHowItWorksIndex = (this.currentHowItWorksIndex + 1) % images.length;
    }, 10000);
  }
}
