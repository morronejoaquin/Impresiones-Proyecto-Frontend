import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalculatorService } from '../../../services/Calculator/calculator-service';
import { BindingTypeEnum } from '../../../models/Enums/bindingTypeEnum';
import PriceCalculationRequest from '../../../models/Prices/priceCalculationRequest';
import PriceCalculationResponse from '../../../models/Prices/priceCalculationResponse';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-price-calculator-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './price-calculator-page.html',
  styleUrls: ['./price-calculator-page.css']
})
export class PriceCalculatorPage implements OnInit, OnDestroy {

  calculatorForm: FormGroup;
  priceResult: PriceCalculationResponse | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  bindingOptions = [
    { value: BindingTypeEnum.NONE, label: 'Ninguno' },
    { value: BindingTypeEnum.RINGED, label: 'Anillado' },
    { value: BindingTypeEnum.STAPLED, label: 'Grapado' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private calculatorService: CalculatorService,
    private fb: FormBuilder
  ) {
    this.calculatorForm = this.fb.group({
      pages: [1, [Validators.required, Validators.min(1)]],
      copies: [1, [Validators.required, Validators.min(1)]],
      binding: [BindingTypeEnum.NONE, Validators.required],
      color: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.calculatorForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.calcularPrecio();
      });

    // Calcular precio inicial
    this.calcularPrecio();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calcularPrecio(): void {
    if (this.calculatorForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const formValue = this.calculatorForm.value;
      const request: PriceCalculationRequest = {
        pages: formValue.pages,
        copies: formValue.copies,
        color: formValue.color,
        binding: formValue.binding
      };

      this.calculatorService.calculation(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.priceResult = response;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al calcular precio:', error);
            this.errorMessage = 'Error al calcular el precio. Intente nuevamente.';
            this.isLoading = false;
          }
        });
    }
  }
}
