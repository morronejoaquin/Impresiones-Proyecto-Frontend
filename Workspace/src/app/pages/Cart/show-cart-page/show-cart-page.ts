import { UserService } from './../../../services/Users/user-service';
import { CartService } from './../../../services/Cart/cart-service';
import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';
import OrderItem from '../../../models/OrderItem/orderItem';
import { switchMap } from 'rxjs';

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
  private currentCartId!: string

  constructor(private router:Router,private orderService:OrderService,private cartService:CartService,private userService:UserService) {}

  ngOnInit(): void {
    const userId = this.userService.getDecodedUserPayload()?.userId;
  
    if (!userId) {
      console.error('No se encontró userId en el payload');
      return;
    }
  
    // Usamos getOrCreateActiveCart para asegurar que el usuario siempre tenga un carrito "pending"
    
  }

  updateCartTotal() {
  }

  removeItem(orderId: string) {
    
  }

  editItem(orderId: string) {
    this.router.navigate(['/make-order', orderId]);
  }

  clearCart() {
    
  }

  proceedToPayment() {
    this.router.navigate(['/cart-payment']);
  }

  confirmAndClearCart(): void {
    const confirmed = confirm('¿Estás seguro de que deseas vaciar el carrito?');
    if (confirmed) {
      this.clearCart();
    }
  }

  confirmAndRemoveItem(itemId: string): void {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este ítem?');
    if (confirmed) {
      this.removeItem(itemId);
    }
  }
}