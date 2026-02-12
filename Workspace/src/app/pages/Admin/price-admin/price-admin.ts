import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import { CommonModule } from '@angular/common';
import PricesResponse from '../../../models/Prices/pricesResponse';
import PricesUpdateRequest from '../../../models/Prices/pricesUpdateRequest';
import { NotificationService } from '../../../services/Notification/notification-service';

@Component({
  selector: 'app-price-admin',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './price-admin.html',
  styleUrls: ['./price-admin.css']
})
export class PriceAdminComponent implements OnInit {
  priceForm!: FormGroup;
  public prices: PricesResponse | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private priceService: PriceManagerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.priceForm = this.fb.group({
      pricePerSheetBW: [0, [Validators.required, Validators.min(0.01)]],
      pricePerSheetColor: [0, [Validators.required, Validators.min(0.01)]],
      priceRingedBinding: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.loadPrices();
  }

  loadPrices() {
    this.priceService.getCurrentPrices().subscribe({
      next: (data) => {
        this.prices = data;

        this.priceForm.setValue({
          pricePerSheetBW: this.prices.pricePerSheetBW,
          pricePerSheetColor: this.prices.pricePerSheetColor,
          priceRingedBinding: this.prices.priceRingedBinding
        });
        
      },
      error: (err) => console.error('Error loading prices', err)
    });
  }

  savePrices() {
    if (this.priceForm.invalid) {
      this.priceForm.markAllAsTouched();
      return;
    }

    const updatedPrice: PricesUpdateRequest = this.priceForm.value;
    this.loading = true;

    this.priceService.updatePrices(updatedPrice).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Precios actualizados correctamente!');
        this.loadPrices();
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Error al actualizar precios');
        console.error(err);
      }
    }); 
  }
}
