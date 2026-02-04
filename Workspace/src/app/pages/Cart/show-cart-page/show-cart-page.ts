import { UserService } from './../../../services/Users/user-service';
import { CartService, CartWithItems } from './../../../services/Cart/cart-service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import OrderItem from '../../../models/OrderItem/orderItemResponse';

@Component({
  selector: 'app-show-cart-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './show-cart-page.html',
  styleUrl: './show-cart-page.css'
})
export class ShowCartPage implements OnInit {
  orders: OrderItem[] = [];
  cartTotal: number = 0;
  private currentCartId!: string;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cartService.getOpenCart().subscribe({
      next: (cart: CartWithItems) => {
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
      }
    });
  }

  removeItem(orderId: string): void {
    if (!this.currentCartId) {
      console.error('No cart ID available');
      return;
    }

    this.cartService.deleteCartItem(this.currentCartId, orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(order => order.id !== orderId);
        this.cartTotal = this.orders.reduce((sum, item) => sum + item.amount, 0);
      },
      error: (err) => {
        console.error('Error removing item from cart:', err);
        alert('Error al eliminar el ítem. Por favor, intenta nuevamente.');
      }
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

    this.cartService.closeCartForPayment(this.currentCartId).subscribe({
      next: () => {
        this.router.navigate(['/cart-payment']);
      },
      error: (err) => {
        console.error('Error closing cart:', err);
        alert('Error al procesar el carrito. Por favor, intenta nuevamente.');
      }
    });
  }

  goToOrder(): void {
    this.router.navigate(['/make-order']);
  }

  confirmAndRemoveItem(itemId: string): void {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este ítem?');
    if (confirmed) {
      this.removeItem(itemId);
    }
  }

  getBindingText(binding?: string): string {
    if (!binding) return 'Sin anillado';
    
    const bindingMap: {[key: string]: string} = {
      'ringed': 'Anillado',
      'stapled': 'Abrochado',
      'unringed': 'Sin anillar'
    };
    
    return bindingMap[binding] || binding;
  }
}
