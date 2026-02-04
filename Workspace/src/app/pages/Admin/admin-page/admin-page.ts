import { Component, OnInit } from '@angular/core';
import Cart from '../../../models/Cart/cart';
import { CartService, CartWithItems } from '../../../services/Cart/cart-service';
import OrderItem from '../../../models/OrderItem/orderItem';
import { OrderService } from '../../../services/Orders/order-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
    this.cartService.getCompletedCartsWithDetails().subscribe({
      next: (cartsWithItems) => {
        this.carts = cartsWithItems;
        this.filteredCarts = [...cartsWithItems];
      },
      error: (err) => console.error('Error al cargar pedidos:', err)
    });
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
  if (!newStatus || newStatus === cart.status) return;

  this.savingIds.add(cart.id);

  const becomesCompleted =
    cart.cartStatus !== 'completed' &&
    (['ready','delivered','cancelled'] as Cart['status'][]).includes(newStatus);

  const setsDeliveredAt = newStatus === 'delivered' && !cart.deliveredAt;

  const updates: any = { status: newStatus };
  if (becomesCompleted) {
    updates.cartStatus  = 'completed';
    updates.completedAt = cart.completedAt ?? new Date().toISOString();
  }
  if (setsDeliveredAt) {
    updates.deliveredAt = new Date().toISOString();
  }

  this.cartService.updateCartStatus(
  cart.id,
  updates.status as Cart['status'],
  {
    stampCompletion: becomesCompleted,
    stampDelivery: setsDeliveredAt
  }
).subscribe({
    next: (updated) => {
      cart.status = (updated as any).status ?? newStatus;
      if (becomesCompleted) {
        cart.cartStatus = 'completed';
        (cart as any).completedAt = updates.completedAt;
      }
      if (setsDeliveredAt) {
        (cart as any).deliveredAt = updates.deliveredAt;
      }
      this.filterByStatus();
    },
    error: (e) => console.error('No se pudo actualizar el estado', e),
    complete: () => this.savingIds.delete(cart.id)
  });
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
