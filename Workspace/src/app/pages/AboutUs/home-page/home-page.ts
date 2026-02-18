import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth.service';
import { UserService } from '../../../services/Users/user-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit{

  constructor(public authService: AuthService, public userService: UserService) {
  }

  ngOnInit(): void {
    if(this.authService.getToken()){
      this.userService.loadProfile();
    }
  }
}
