import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/userResponse';
import ProfileResponse from '../../../models/Users/profileResponse';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css'
})
export class AccountPage implements OnInit {
  currentUser: ProfileResponse | null = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    
  }

  logout() {

  }

  editProfile(): void {
    this.router.navigate(['/user-edit']);
  }
}