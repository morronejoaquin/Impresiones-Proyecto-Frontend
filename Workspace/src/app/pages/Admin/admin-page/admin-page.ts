import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/Cart/cart-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';
import CartResponse from '../../../models/Cart/cartResponse';
import Page from '../../../models/PageModel/page';
import CartStatusUpdateRequest from '../../../models/Cart/cartStatusUpdateRequest';
import { NotificationService } from '../../../services/Notification/notification-service';
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModal],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  carts: CartResponse[] = [];
  isLoading = false;
  savingIds = new Set<string>();

  currentPage = 0;
  pageSize = 12;
  totalElements = 0;

  filters = {
    status: null as OrderStatusEnum | null,
    customerEmail: '',
    startDate: '',
    endDate: ''
  };

  showConfirm = false;
  statusToConfirm: { cart: CartResponse, newStatus: OrderStatusEnum } | null = null;
  message = '';

  orderStatusEnum = OrderStatusEnum;
  statusOptions = Object.values(OrderStatusEnum);

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    
    if (this.hasActiveFilters()) {
      this.cartService.filterCartsForAdmin(this.filters, this.currentPage, this.pageSize).subscribe({
        next: (res) => this.handleResponse(res),
        error: () => this.isLoading = false
      });
    } else {
      this.cartService.getActiveCartsForAdmin(this.currentPage, this.pageSize).subscribe({
        next: (res) => this.handleResponse(res),
        error: () => this.isLoading = false
      });
    }
  }

  private handleResponse(response: Page<CartResponse>) {
    this.carts = response.content || [];
    this.totalElements = response.totalElements || 0;
    this.isLoading = false;
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadOrders();
  }

  clearFilters() {
    this.filters = { status: null, customerEmail: '', startDate: '', endDate: '' };
    this.currentPage = 0;
    this.loadOrders();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.status || this.filters.customerEmail || this.filters.startDate || this.filters.endDate);
  }

  onStatusChange(cart: CartResponse, newStatus: OrderStatusEnum) {
    this.statusToConfirm = { cart, newStatus };
    this.message = `¿Confirmar cambio de estado a: ${this.statusLabel(newStatus)}?`;

    if (newStatus === OrderStatusEnum.READY || 
        newStatus === OrderStatusEnum.DELIVERED || 
        newStatus === OrderStatusEnum.CANCELLED) {
      this.showConfirm = true;
    } else {
      this.executeStatusUpdate(cart, newStatus);
    }
    
  }

  confirmChangeStatus() {
    if (this.statusToConfirm) {
      const { cart, newStatus } = this.statusToConfirm;
      this.executeStatusUpdate(cart, newStatus);
      
      this.showConfirm = false;
      this.statusToConfirm = null;
    }
  }

  cancelChangeStatus() {
    this.showConfirm = false;
    this.statusToConfirm = null;
    this.loadOrders(); // Recargamos para asegurar que el select muestre el valor real del backend
  }

  private executeStatusUpdate(cart: CartResponse, newStatus: OrderStatusEnum) {
    this.savingIds.add(cart.id);
    const request: CartStatusUpdateRequest = { status: newStatus };

    this.cartService.actualizarEstado(cart.id, request).subscribe({
      next: (updatedCart) => {
        cart.status = updatedCart.status;
        this.notificationService.success(`Pedido actualizado a ${this.statusLabel(newStatus)}`);
        
        // Simulación de guardado para la UI
        setTimeout(() => this.savingIds.delete(cart.id), 1000);
      },
      error: (err) => {
        this.notificationService.error("Error al actualizar el estado");
        this.savingIds.delete(cart.id);
        this.loadOrders(); // Revertir UI
      }
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

  goToDetail(id: string) { 
    this.router.navigate(['/admin/order', id]); 
  }

  statusLabel(v: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente', 
      'PRINTING': 'Imprimiendo', 
      'BINDING': 'Anillando',
      'READY': 'Listo', 
      'DELIVERED': 'Entregado', 
      'CANCELLED': 'Cancelado'
    };
    return labels[v] || v;
  }

  get totalPages(): number { 
    return Math.ceil(this.totalElements / this.pageSize); 
  }
}
