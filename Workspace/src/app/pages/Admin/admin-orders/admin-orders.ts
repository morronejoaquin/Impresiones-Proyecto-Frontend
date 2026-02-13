import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/Cart/cart-service';
import CartResponse from '../../../models/Cart/cartResponse';
import Page from '../../../models/PageModel/page';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  carts: CartResponse[] = [];
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  isLoading = false;
  orderStatusEnum = OrderStatusEnum;

  // Status colors mapping
  statusColorMap: { [key: string]: string } = {
    'PENDING': '#FFC107',      // Amarillo
    'PRINTING': '#2196F3',     // Azul
    'BINDING': '#9C27B0',      // Púrpura
    'READY': '#4CAF50',        // Verde
  };

  statusLabelMap: { [key: string]: string } = {
    'PENDING': 'PENDIENTE',
    'PRINTING': 'IMPRIMIENDO',
    'BINDING': 'ENCUADERNANDO',
    'READY': 'LISTO',
  };

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.cartService.getActiveCartsForAdmin(this.currentPage, this.pageSize).subscribe({
      next: (response: Page<CartResponse>) => {
        this.carts = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
      }
    });
  }

  refreshOrders(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  getStatusBadgeClass(status: OrderStatusEnum | null | undefined): string {
    if (!status) return 'badge-light';
    
    switch (status) {
      case OrderStatusEnum.PENDING:
        return 'badge-warning';
      case OrderStatusEnum.PRINTING:
        return 'badge-info';
      case OrderStatusEnum.BINDING:
        return 'badge-secondary';
      case OrderStatusEnum.READY:
        return 'badge-success';
      default:
        return 'badge-light';
    }
  }

  getStatusLabel(status: OrderStatusEnum | null | undefined): string {
    if (!status) return 'N/A';
    return this.statusLabelMap[status] || status;
  }

  getStatusColor(status: OrderStatusEnum | null | undefined): string {
    if (!status) return '#6C757D';
    return this.statusColorMap[status] || '#6C757D';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalElements) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }
}
