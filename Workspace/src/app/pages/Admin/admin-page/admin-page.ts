import { Component, OnInit } from '@angular/core';
import Cart from '../../../models/Cart/cart';
import { CartService } from '../../../services/Cart/cart-service';
import OrderItem from '../../../models/OrderItem/orderItem';
import { OrderService } from '../../../services/Orders/order-service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface CartWithItems extends Cart {
  orderItems: OrderItem[];
  fileSummary: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})


export class AdminPage implements OnInit {
  carts: CartWithItems[] = [];

  filteredCarts: CartWithItems[] = [];
  filterStatus: string = '';
  filterSurname: string = '';

  readonly STATUSES = ['pending', 'printing', 'binding', 'ready', 'delivered', 'cancelled'];
  savingIds = new Set<string>();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCompletedCarts();
  }

  loadCompletedCarts(): void {
    
  }

  filterByStatus(): void {
    if (!this.filterStatus) { this.filteredCarts = [...this.carts]; return; }
    this.filteredCarts = this.carts.filter(c => c.status === this.filterStatus);
  }

  filterBySurname(): void {
    if (!this.filterSurname) { this.filteredCarts = [...this.carts]; return; }
    const search = this.filterSurname.toLowerCase();
    this.filteredCarts = this.carts.filter(c => c.customer?.surname?.toLowerCase().includes(search));
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterSurname = '';
    this.filteredCarts = [...this.carts];
  }

  updateStatus(cart: CartWithItems, newStatus: Cart['status']) {
  
  }

  goToDetail(cart: CartWithItems) {
    this.router.navigate(['/admin/order', cart.id]);
  }

  goToPriceAdmin() {
    this.router.navigate(['/admin/prices']);
  }

  goToRecordAdmin() {
    this.router.navigate(['/admin/record'])
  }

  onStatusChange(cart: CartWithItems, value: string) {
  this.updateStatus(cart, value as unknown as Cart['status']);
}

statusLabel(v?: 'ready' | 'delivered' | 'cancelled' | 'pending' | 'printing' | 'binding'): string {
  switch (v) {
    case 'pending':   return 'Pendiente';
    case 'printing':  return 'Imprimiendo';
    case 'binding':   return 'Encuadernando';
    case 'ready':     return 'Listo';
    case 'delivered': return 'Entregado';
    case 'cancelled': return 'Cancelado';
    default:         return '-';
  }
}

}
