import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/Cart/cart-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Page from '../../../models/PageModel/page';
import CartHistoryResponse from '../../../models/Cart/cartHistoryResponse';
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';
import { NotificationService } from '../../../services/Notification/notification-service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModal],
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

  cancelCartId: string | null = null;
  showConfirm = false;
  message = '';

  @ViewChild('top') topElement!: ElementRef;

  // Estados para traducir los valores de la API
  private orderStatusMap: { [key: string]: string } = {
    'PENDING': 'Recibido',
    'PRINTING': 'Imprimiendo',
    'BINDING': 'Encuadernando',
    'READY': 'Listo para retirar',
    'DELIVERED': 'Entregado',
    'CANCELLED': 'Cancelado'
  };

  private paymentStatusMap: { [key: string]: string } = {
    'PENDING': 'Pago Pendiente',
    'APPROVED': 'Pago Aprobado',
    'REJECTED': 'Pago Rechazado',
    'UNKNOWN': 'Pendiente de Pago',
  };

  constructor(private cartService: CartService, private router: Router, private notificationService: NotificationService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadOrders();

    this.route.params.subscribe(params => {
    const targetId = params['id'];
    if (targetId) {
      this.highlightOrder(targetId);
    }
  });
  }

  loadOrders(shouldScroll: boolean = false): void {
    this.loading = true;
    this.cartService.getMyOrders(this.currentPage, this.pageSize).subscribe({
      next: (page: Page<CartHistoryResponse>) => {
        this.orders = page.content || [];
        this.totalPages = page.totalPages || 0;
        this.totalElements = page.totalElements || 0;
        this.hasNextPage = !page.last;
        this.loading = false;

        if (shouldScroll) {
          this.scrollToTop();
        }
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.orders = [];
        this.loading = false;
      }
    });
  }

  scrollToTop(): void {
    setTimeout(() => {
      if (this.topElement) {
        this.topElement.nativeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }

  highlightOrder(id: string) {
    setTimeout(() => {
      const element = document.getElementById('order-' + id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-order');
      }
    }, 600);
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

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders(true);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadOrders(true);
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

  prepareCancelOrder(cartId: string){
    this.cancelCartId = cartId;
    this.message = '¿Estás seguro de que deseas cancelar este pedido?';
    this.showConfirm = true;
  }

  cancelOrder() {
    if(!this.cancelCartId) return;

    this.cartService.cancelOrder(this.cancelCartId as string).subscribe({
      next: () => {
        this.notificationService.success("Su pedido ha sido cancelado correctamente");
        this.finalizarAccion();
      },
      error: (err) => {
        if (err.status === 200) {
          this.notificationService.success("Su pedido ha sido cancelado correctamente");
          this.finalizarAccion();
        } else {
          this.notificationService.error("Ha ocurrido un error al intentar cancelar su pedido");
          console.error(err);
          this.showConfirm = false;
        }
      }
    })
  }

  confirmCancelOrder() {
    this.cancelOrder();
    this.showConfirm = false;
  }

  cancelCancelOrder() {
    this.showConfirm = false;
    this.loadOrders();
  }

  private finalizarAccion() {
    this.showConfirm = false;
    this.cancelCartId = null;
    this.loadOrders();
  }
}

