import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/userResponse';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/Payment/payment-service';
import { CartService } from '../../../services/Cart/cart-service';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';
import { switchMap } from 'rxjs';
import { NotificationService } from '../../../services/Notification/notification-service';
import { PaymentMethodEnum } from '../../../models/Enums/paymentMethodEnum';
import PaymentCreateRequest from '../../../models/Payment/paymentCreateRequest';

@Component({
  selector: 'app-cart-payment-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart-payment-page.html',
  styleUrl: './cart-payment-page.css'
})
export class CartPaymentPage implements OnInit{
  
  cartForm: FormGroup;
  cartTotal: number = 0;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.cartForm = this.fb.group({
      paymentMethod: ['CASH', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCartSummary();
  }

  loadCartSummary(): void {
    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.cartTotal = cart.total;
      },
      error: () => {
        this.notificationService.error('Error al cargar el resumen del carrito');
        this.router.navigate(['/cart']);
      }
    });
  }

  onSubmit(): void {
    if (this.cartForm.invalid) return;

    this.isLoading = true;
    const request: PaymentCreateRequest = {
      paymentMethod: this.cartForm.value.paymentMethod
    };

    this.paymentService.checkout(request).subscribe({
      next: (response) => {
        if (response.action === 'REDIRECT' && response.checkoutUrl) {
          window.location.href = response.checkoutUrl; // Redirige a Mercado Pago
        } else {
          this.isLoading = false;
          this.router.navigate(['/order-success'], { 
            queryParams: { orderId: response.cartId } 
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        
        const errorMsg = err.status === 0 || err.status === 503 
        ? "No pudimos conectar con la pasarela, intenta más tarde" 
        : (err.error?.message || "Hubo un problema al procesar el pago");
        
        this.notificationService.error(errorMsg);
      }
    });
  }
}
