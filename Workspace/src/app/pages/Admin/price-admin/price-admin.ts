import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import Prices from '../../../models/Prices/Prices';

@Component({
  selector: 'app-price-admin',
  imports: [ReactiveFormsModule],
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
    
  }

  savePrices() {
    
  }
}
