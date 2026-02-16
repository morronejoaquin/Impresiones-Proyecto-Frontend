import { UserService } from './../../../services/Users/user-service';
import CartWithItemsResponse from './../../../models/Cart/cartWithItemsResponse';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import OrderItem from '../../../models/OrderItem/orderItemResponse';
import { CartService } from '../../../services/Cart/cart-service';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';
import { Subject, takeUntil } from 'rxjs';
import { CartTotalComponent } from '../../../components/cart-total/cart-total';
import { NotificationService } from '../../../services/Notification/notification-service';
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-show-cart-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CartTotalComponent, ConfirmModal],
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
    private notificationService: NotificationService
  ) {}

  get calculatedCartTotal(): number {
    return this.orders.reduce((acc, item) => acc + (item.amount || 0), 0);
  }

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

    this.router.navigate(['cart-payment'])
  }

  goToOrder(): void {
    this.router.navigate(['/make-order']);
  }

  confirmAndRemoveItem(itemId: string): void {
    this.itemToDeleteId = itemId;
  }

  cancelDelete(): void {
    if (this.isDeleting) return;
    this.itemToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.itemToDeleteId) {
      this.isDeleting = true; // Activa estado de carga
      this.executeDelete();
    }
  }

  executeDelete(): void {
  if (!this.itemToDeleteId) return;
  
  const idABorrar = this.itemToDeleteId; 
  this.isDeleting = true;

  this.cartService.eliminarItem(idABorrar).subscribe({
    next: () => {
      // Éxito: Filtramos y cerramos
      this.finalizarEliminacionLocal(idABorrar);
    },
    error: (err) => {
      // Manejo del error de parsing (Status 200 pero texto plano)
      if (err.status === 200 || err.ok) {
        this.finalizarEliminacionLocal(idABorrar);
      } else {
        this.notificationService.error('No se pudo eliminar el archivo');
        this.isDeleting = false;
        console.error('Error real:', err);
      }
    }
  });
}

private finalizarEliminacionLocal(id: string): void {
  // 1. Quitamos el item del array local INMEDIATAMENTE
  this.orders = [...this.orders.filter(o => o.id !== id)];
  
  // 2. Limpiamos estados
  this.itemToDeleteId = null;
  this.isDeleting = false;
  
  // 3. Feedback visual
  this.notificationService.success('Archivo eliminado correctamente');
  
  // 4. Forzamos al servicio a refrescar (opcional pero recomendado)
  this.cartService.refreshCart();
}
  
  getBindingText(binding?: string): string {
    if (!binding) return 'Sin anillado';

    const bindingMap: { [key: string]: string } = {
      RINGED: 'Anillado',
      STAPLED: 'Abrochado',
      NONE: 'Sin anillar',
    };

    return bindingMap[binding] || binding;
  }
}
