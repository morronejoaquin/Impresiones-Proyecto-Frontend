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
      <h3>Total del Carrito: ${{ total | number:'1.2-2' }}</h3>
    </div>
  `,
  styles: [`
    .cart-total-wrapper {
      text-align: right;
      padding: 1rem 0;
      border-top: 2px solid #e0e0e0;
    }

    h3 {
      font-size: 1.5rem;
      color: #333;
      margin: 0;
    }
  `]
})
export class CartTotalComponent implements OnInit, OnDestroy {
  @Input() total: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        if (cart) {
          this.total = cart.total;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
