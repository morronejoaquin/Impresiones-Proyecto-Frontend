import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreLocationService } from '../../../services/Location/StoreLocationService';
import { SafeUrlPipe } from '../pipes/safe-url.pipe'; // Asegurate que la ruta al pipe sea correcta

@Component({
  selector: 'app-where-page',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './where-page.html',
  styleUrl: './where-page.css'
})
export class WherePage implements OnInit {
  location: any;
  isLoading = false;

  constructor(private storeService: StoreLocationService) {}

  ngOnInit() {
    this.isLoading = true;

    this.storeService.getLocation().subscribe({
      next: (loc) => {
        this.location = loc;
        this.isLoading = false;
      },
      error: (err) => {
        // Fallback: Coordenadas por defecto (ej. Mar del Plata) si falla el back
        this.location = { lat: -38.0055, lng: -57.5426 };
        this.isLoading = false;
      }
    });
  }

  get mapUrl() {
    if (!this.location) return '';
    // URL ESTÁNDAR DE GOOGLE MAPS (Corregida)
    return `https://maps.google.com/maps?q=${this.location.lat},${this.location.lng}&z=16&output=embed`;
  }

  get externalMapUrl() {
    if (!this.location) return '';
    return `https://www.google.com/maps/dir/?api=1&destination=${this.location.lat},${this.location.lng}`;
  }
}