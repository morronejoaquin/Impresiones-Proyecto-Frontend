import { StoreLocationService } from '../../../services/Location/StoreLocationService';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';
@Component({
  selector: 'app-where-page',
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './where-page.html',
  styleUrl: './where-page.css'
})
export class WherePage implements OnInit {
location:any;

  constructor(private storeService: StoreLocationService) {}

  ngOnInit(){
    this.storeService.getLocation().subscribe(loc => this.location = loc);
  }

  get mapUrl(){
    if(!this.location) return '';
    return `https://maps.google.com/maps?q=${this.location.lat},${this.location.lng}&z=16&output=embed`;
  }
}