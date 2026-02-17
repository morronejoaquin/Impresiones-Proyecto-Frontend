import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/Payment/payment-service';
import { CartService } from '../../../services/Cart/cart-service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/Notification/notification-service';
import PaymentCreateRequest from '../../../models/Payment/paymentCreateRequest';
import OrderItemResponse from '../../../models/OrderItem/orderItemResponse';
import CartWithItemsResponse from '../../../models/Cart/cartWithItemsResponse';
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-cart-payment-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ConfirmModal],
  templateUrl: './cart-payment-page.html',
  styleUrl: './cart-payment-page.css'
})
export class CartPaymentPage implements OnInit{
  
  cartForm: FormGroup;
  orders: OrderItemResponse[] = [];
  cartTotal: number = 0;
  isLoading: boolean = true;
  showConfirmModal: boolean = false;

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
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getMyCart().subscribe({
      next: (cart: CartWithItemsResponse) => {

        if (!cart.items || cart.items.length === 0) {
          this.notificationService.info('Tu carrito está vacío, agrega algo para continuar.');
          this.router.navigate(['/make-order']);
          return;
        }

        this.orders = cart.items;
        this.cartTotal = cart.total;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Error al cargar el resumen del carrito');
        this.router.navigate(['/cart']);
      }
    });
  }

  getBindingText(binding?: string): string {
    if (!binding) return 'Sin anillado';

    const options: { [key: string]: string } = {
      'NONE': 'Sin anillar',
      'RINGED': 'Anillado',
      'STAPLED': 'Abrochado'
    };
    return options[binding] || binding;
  }

  onSubmit(): void {
    if (this.cartForm.invalid) return;
    this.showConfirmModal = true;
  }

  executePayment(): void {

    this.showConfirmModal = false;
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
          this.router.navigate(['/order-received'], { 
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

  cancelPayment(): void {
    this.showConfirmModal = false;
  }
}
