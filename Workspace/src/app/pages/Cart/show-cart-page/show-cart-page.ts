import { UserService } from './../../../services/Users/user-service';
import CartWithItemsResponse from './../../../models/Cart/cartWithItemsResponse';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import OrderItem from '../../../models/OrderItem/orderItemResponse';
import { CartService } from '../../../services/Cart/cart-service';
import { CartStatusEnum } from '../../../models/Enums/cartStatusEnum';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';
import { CartTotalComponent } from '../../../components/cart-total/cart-total';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-show-cart-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CartTotalComponent],
  templateUrl: './show-cart-page.html',
  styleUrl: './show-cart-page.css',
})
export class ShowCartPage implements OnInit, OnDestroy {
  orders: OrderItem[] = [];
  cartTotal: number = 0;
  private currentCartId!: string;
  isLoading: boolean = true;
  errorMessage: string = '';
  itemToDeleteId: string | null = null;
  isDeleting: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadCart();

    this.cartService.cartUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        if (cart) {
          this.currentCartId = cart.id;
          this.orders = cart.items || [];
          this.cartTotal = cart.total;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cartService.getMyCart().subscribe({
      next: (cart: CartWithItemsResponse) => {
        this.currentCartId = cart.id;
        this.orders = cart.items || [];
        this.cartTotal = cart.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching cart:', err);
        this.isLoading = false;

        if (err.status === 404) {
          this.errorMessage = 'No tienes un carrito activo.';
          this.orders = [];
          this.cartTotal = 0;
        } else if (err.status === 403) {
          this.errorMessage = 'No tienes permiso para ver el carrito.';
        } else {
          this.errorMessage = 'Error al cargar el carrito. Por favor, intenta nuevamente.';
        }
      },
    });
  }

  removeItem(orderId: string): void {
    if (!this.currentCartId) return;

    this.cartService.eliminarItem(orderId).subscribe({
      next: () => {
        // Actualizamos la lista visualmente
        this.orders = this.orders.filter((order) => order.id !== orderId);
        this.cartTotal = this.orders.reduce((sum, item) => sum + item.amount, 0);
        
        // --- ESTO ES LO NUEVO ---
        this.itemToDeleteId = null; // Cierra el modal
        this.isDeleting = false;    // Apaga el loading
        
        if (this.orders.length === 0) {
          this.errorMessage = 'Tu carrito quedó vacío.';
        }
      },
      error: (err) => {
        console.error('Error removing item:', err);
        alert('Error al eliminar. Intente nuevamente.');
        this.isDeleting = false; // Apaga el loading aunque falle
      },
    });
  }

  editItem(orderId: string): void {
    this.router.navigate(['/make-order', orderId]);
  }

  proceedToPayment(): void {
    if (!this.currentCartId) {
      console.error('No cart ID available');
      return;
    }

    if (this.orders.length === 0) {
      alert('No puedes proceder al pago con un carrito vacío.');
      return;
    }

    this.cartService
      .actualizarEstado(this.currentCartId, { status: OrderStatusEnum.PENDING })
      .subscribe({
        next: () => {
          this.router.navigate(['/cart-payment']);
        },
      });
  }

  goToOrder(): void {
    this.router.navigate(['/make-order']);
  }

  confirmAndRemoveItem(itemId: string): void {
    this.itemToDeleteId = itemId;
  }

  cancelDelete(): void {
    this.itemToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.itemToDeleteId) {
      this.isDeleting = true; // Activa estado de carga
      this.removeItem(this.itemToDeleteId);
    }
  }

  getBindingText(binding?: string): string {
    if (!binding) return 'Sin anillado';

    const bindingMap: { [key: string]: string } = {
      ringed: 'Anillado',
      stapled: 'Abrochado',
      unringed: 'Sin anillar',
    };

    return bindingMap[binding] || binding;
  }
}
