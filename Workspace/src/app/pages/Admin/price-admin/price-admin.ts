import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import Prices from '../../../models/Prices/pricesResponse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-admin',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './price-admin.html',
  styleUrls: ['./price-admin.css']
})
export class PriceAdminComponent implements OnInit {
  priceForm!: FormGroup;
  prices: Prices[] = [];
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private priceService: PriceManagerService
  ) {}

  ngOnInit(): void {
    this.priceForm = this.fb.group({
      pricePerSheetBW: [0, [Validators.required, Validators.min(0)]],
      pricePerSheetColor: [0, [Validators.required, Validators.min(0)]],
      priceRingedBinding: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadPrices();
  }

  loadPrices() {
    this.priceService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;

        if (this.prices.length > 0) {
          const price = this.prices[0];
          this.priceForm.setValue({
            pricePerSheetBW: price.pricePerSheetBW,
            pricePerSheetColor: price.pricePerSheetColor,
            priceRingedBinding: price.priceRingedBinding
          });
        }
      },
      error: (err) => console.error('Error loading prices', err)
    });
  }

  savePrices() {
    if (this.priceForm.invalid) {
      this.priceForm.markAllAsTouched();
      this.message = 'Por favor, ingrese valores válidos (números positivos).';
      return;
    }

    const formValues = this.priceForm.value;

    if (this.prices.length > 0) {
      const updatedPrice: Prices = {
        id: this.prices[0].id,
        ...formValues
      };
      console.log(updatedPrice.id + "Este es el que estamos modificando")

      this.loading = true;
      this.priceService.updatePrices(updatedPrice).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Precios actualizados correctamente!';
          this.loadPrices();
        },
        error: (err) => {
          this.loading = false;
          this.message = 'Error al actualizar precios';
          console.error(err);
        }
      });
    } 
    else {
      const newPrice: Prices = {
        id: 0, 
        ...formValues
      };

      this.loading = true;
      this.priceService.postPrices(newPrice).subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Precio creado correctamente!';
          this.loadPrices();
        },
        error: (err) => {
          this.loading = false;
          this.message = 'Error al crear el precio';
          console.error(err);
        }
      });
    }
  }
}
