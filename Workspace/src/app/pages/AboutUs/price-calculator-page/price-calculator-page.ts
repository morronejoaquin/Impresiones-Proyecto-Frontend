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
  errorType: 'NONE' | 'CONNECTION' = 'NONE';

  bindingOptions = [
    { value: BindingTypeEnum.NONE, label: 'Ninguno' },
    { value: BindingTypeEnum.RINGED, label: 'Anillado' },
    { value: BindingTypeEnum.STAPLED, label: 'Abrochado' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private calculatorService: CalculatorService,
    private fb: FormBuilder
  ) {
    this.calculatorForm = this.fb.group({
      pages: [1, [Validators.required, Validators.min(1), Validators.max(10000)]],
      copies: [1, [Validators.required, Validators.min(1), Validators.max(10000)]],
      binding: [BindingTypeEnum.NONE, Validators.required],
      color: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.calculatorForm.get('pages')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(pages => {
      const currentBinding = this.calculatorForm.get('binding')?.value;
      
      // Si la opción actual ya no es válida según las reglas, reseteamos a NONE
      if ((currentBinding === BindingTypeEnum.RINGED && pages <= 8) ||
          (currentBinding === BindingTypeEnum.STAPLED && (pages < 2 || pages > 50))) {
        this.calculatorForm.patchValue({ binding: BindingTypeEnum.NONE });
      }
    });

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
      this.errorType = 'NONE';

      const formValue = this.calculatorForm.value;
      const request: PriceCalculationRequest = {
        pages: formValue.pages,
        copies: formValue.copies,
        color: formValue.color,
        doubleSided: formValue.isDoubleSided,
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
            this.isLoading = false;
            this.errorType = 'CONNECTION';
          }
        });
    }
  }

  isOptionAvailable(binding: string): boolean {
    const pages = this.calculatorForm.get('pages')?.value || 0;
    
    if (binding === BindingTypeEnum.RINGED) return pages >= 8;
    if (binding === BindingTypeEnum.STAPLED) return pages >= 2 && pages <= 50;
    return true;
  }
}
