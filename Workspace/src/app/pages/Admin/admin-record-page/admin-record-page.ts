import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/Cart/cart-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import CartWithItemsResponse from '../../../models/Cart/cartWithItemsResponse';

@Component({
  selector: 'app-admin-record-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-record-page.html',
  styleUrl: './admin-record-page.css'
})

export class AdminRecordPage implements OnInit {
  carts: CartWithItemsResponse[] = [];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompletedCarts();
  }

  loadCompletedCarts(): void {
    
  }

  goToDetail(cart: CartWithItemsResponse){
    this.router.navigate(['/admin/order', cart.id])
  }
}
