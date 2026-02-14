import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../services/Cart/cart-service';

@Component({
  selector: 'app-cart-total',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-total-wrapper">
      <div class="total-row">
        <span class="label">Total a pagar:</span>
        <span class="amount">$ {{total | number:'1.2-2'}}</span>
      </div>
    </div>
  `,
  styles: [`
    .cart-total-wrapper {
      padding: 1rem 0 1.5rem 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .label {
      font-size: 1.1rem;
      color: #666;
      font-weight: 500;
    }
    .amount {
      font-size: 1.8rem;
      font-weight: 800;
      color: #1976d2;
    }
  `]
})
export class CartTotalComponent {
  @Input() total: number = 0;
}
