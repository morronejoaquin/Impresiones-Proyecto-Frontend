import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';

@Component({
  selector: 'app-price-calculator-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './price-calculator-page.html',
  styleUrls: ['./price-calculator-page.css']
})
export class PriceCalculatorPage implements OnInit {

  calculatorForm: FormGroup;
  calculatedPrice: number | null = null;

  constructor(private priceS: PriceManagerService, private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      pages: [1, [Validators.required, Validators.min(1)]],
      copies: [1, [Validators.required, Validators.min(1)]],
      isDoubleSided: [false, Validators.required],
      binding: [null],
      isColor: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarPrecios();
  }

  cargarPrecios() {
    
  }

  calcularPrecio() {
    
  }
}
