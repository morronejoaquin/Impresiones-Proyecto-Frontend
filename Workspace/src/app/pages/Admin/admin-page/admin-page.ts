import { Component, OnInit } from '@angular/core';
import Cart from '../../../models/Cart/cartResponse';
import { CartService } from '../../../services/Cart/cart-service';
import { OrderService } from '../../../services/Orders/order-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import CartWithItemsResponse from '../../../models/Cart/cartWithItemsResponse';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  carts: CartWithItemsResponse[] = [];
  orderStatus = OrderStatusEnum;

  filteredCarts: CartWithItemsResponse[] = [];
  filterStatus: string = '';
  filterSurname: string = '';

  readonly STATUSES = ['pending', 'printing', 'binding', 'ready', 'delivered', 'cancelled'];
  savingIds = new Set<string>();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCompletedCarts();
  }

  loadCompletedCarts(): void {}

  filterByStatus(): void {
    if (!this.filterStatus) {
      this.filteredCarts = [...this.carts];
      return;
    }
    this.filteredCarts = this.carts.filter((c) => c.status === this.filterStatus);
  }

  filterBySurname(): void {}

  clearFilters(): void {
    this.filterStatus = '';
    this.filterSurname = '';
    this.filteredCarts = [...this.carts];
  }

  updateStatus(cart: CartWithItemsResponse, newStatus: Cart['status']) {}

  goToDetail(cart: CartWithItemsResponse) {
    this.router.navigate(['/admin/order', cart.id]);
  }

  goToPriceAdmin() {
    this.router.navigate(['/admin/prices']);
  }

  goToRecordAdmin() {
    this.router.navigate(['/admin/record']);
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  goToReconciliation() {
    this.router.navigate(['/admin/reconciliation']);
  }

  onStatusChange(cart: CartWithItemsResponse, value: string) {
    this.updateStatus(cart, value as unknown as Cart['status']);
  }

  statusLabel(v: OrderStatusEnum | undefined): string {
    if (!v) return '-';

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      printing: 'Imprimiendo',
      binding: 'Encuadernando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };

    return labels[v as string] || '-';
  }
}
