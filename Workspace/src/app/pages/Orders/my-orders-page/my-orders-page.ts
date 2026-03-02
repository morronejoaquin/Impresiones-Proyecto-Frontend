import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/Cart/cart-service';
import { Router, RouterModule } from '@angular/router';
import Page from '../../../models/PageModel/page';
import CartHistoryResponse from '../../../models/Cart/cartHistoryResponse';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders-page.html',
  styleUrls: ['./my-orders-page.css']
})
export class MyOrdersPage implements OnInit {
  orders: CartHistoryResponse[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 4;
  totalPages = 0;
  totalElements = 0;
  hasNextPage = false;

  // Estados para traducir los valores de la API
  private orderStatusMap: { [key: string]: string } = {
    'PENDING': 'Recibido',
    'PRINTING': 'Imprimiendo',
    'BINDING': 'Encuadernando',
    'READY': 'Listo',
    'DELIVERED': 'Entregado',
    'CANCELLED': 'Cancelado'
  };

  private paymentStatusMap: { [key: string]: string } = {
    'PENDING': 'Pago Pendiente',
    'APPROVED': 'Pago Aprobado',
    'REJECTED': 'Pago Rechazado',
    'UNKNOWN': 'Pendiente de Pago',
  };

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.cartService.getMyOrders(this.currentPage, this.pageSize).subscribe({
      next: (page: Page<CartHistoryResponse>) => {
        this.orders = page.content || [];
        this.totalPages = page.totalPages || 0;
        this.totalElements = page.totalElements || 0;
        this.hasNextPage = !page.last;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.orders = [];
        this.loading = false;
      }
    });
  }

  getOrderStatusLabel(status: string | null | undefined): string {
    if (!status) return '-';
    return this.orderStatusMap[status] || status;
  }

  getPaymentStatusLabel(paymentStatus: string | null | undefined): string {
    if (!paymentStatus) return '-';
    return this.paymentStatusMap[paymentStatus] || paymentStatus;
  }

  goToStore(): void {
    this.router.navigate(['/make-order']);
  }

  goToOrderDetails(cartId: string): void {
    this.router.navigate(['/order-detail', cartId]);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  getFormattedDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

