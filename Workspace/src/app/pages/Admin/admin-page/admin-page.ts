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

type PendingAction = {
  execute: () => void;
  message: string;
  subMessage?: string;
};

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

  pendingAction: PendingAction | null = null;
  showConfirm = false;
  statusToConfirm: { cart: CartResponse, newStatus: OrderStatusEnum } | null = null;
  message = '';

  orderStatusEnum = OrderStatusEnum;
  statusOptions = Object.values(OrderStatusEnum);

  errorType: 'NONE' | 'CONNECTION' | 'NO_RESULTS' = 'NONE';

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
    this.errorType = 'NONE';
    
    if (this.hasActiveFilters()) {
      this.cartService.filterCartsForAdmin(this.filters, this.currentPage, this.pageSize).subscribe({
        next: (res) => this.handleResponse(res),
        error: () => {
          this.isLoading = false;
          this.errorType = 'CONNECTION';
        }
      });
    } else {
      this.cartService.getActiveCartsForAdmin(this.currentPage, this.pageSize).subscribe({
        next: (res) => this.handleResponse(res),
        error: () => {
          this.isLoading = false;
          this.errorType = 'CONNECTION';
        }
      });
    }
  }

  private handleResponse(response: Page<CartResponse>) {
    this.carts = response.content || [];
    this.totalElements = response.totalElements || 0;
    this.isLoading = false;

    // Lógica de detección de estado
    if (this.carts.length === 0) {
      this.errorType = 'NO_RESULTS';
    } else {
      this.errorType = 'NONE';
    }
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
    const isMovingBackwards = cart.status === OrderStatusEnum.READY && 
                            [OrderStatusEnum.PENDING, OrderStatusEnum.PRINTING, OrderStatusEnum.BINDING].includes(newStatus);
  
    const isFinalState = [OrderStatusEnum.READY, OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED].includes(newStatus);

    this.message = `¿Confirmar cambio de estado a ${this.statusLabel(newStatus)}?`;

    const action: PendingAction = {
      execute: () => this.executeStatusUpdate(cart, newStatus),
      message: this.message
    };

    if (isMovingBackwards) {
      action.subMessage = `Este pedido ya estaba listo y el cliente fue notificado`;
    }

    if (newStatus === OrderStatusEnum.READY) {
      action.subMessage = 'Se le enviará una notificación al usuario';
    }

    this.pendingAction = action;

    if (isFinalState || isMovingBackwards) {
      this.showConfirm = true;
    } else {
      action.execute();
    }
    
  }

  confirmChangeStatus() {
    if (this.pendingAction) {
      this.pendingAction.execute();
      this.showConfirm = false;
      this.pendingAction = null;
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

        let msg = `Pedido actualizado a ${this.statusLabel(newStatus)}`;
      
        if (newStatus === 'READY') {
          msg += ". Se notificó al usuario";
        }

        this.notificationService.success(msg);
        
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
