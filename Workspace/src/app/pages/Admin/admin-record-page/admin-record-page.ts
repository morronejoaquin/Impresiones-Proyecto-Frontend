import { Component } from '@angular/core';
import { CartService, CartWithItems } from '../../../services/Cart/cart-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-record-page',
  imports: [CommonModule , RouterLink],
  templateUrl: './admin-record-page.html',
  styleUrl: './admin-record-page.css'
})

export class AdminRecordPage {
  carts: CartWithItems[] = [];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompletedCarts();
  }

  loadCompletedCarts(): void {
    
  }

  goToDetail(cart: CartWithItems){
    this.router.navigate(['/admin/order', cart.id])
  }
}
