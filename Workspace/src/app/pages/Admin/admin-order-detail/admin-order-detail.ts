import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import Cart from '../../../models/Cart/cartResponse';
import OrderItem from '../../../models/OrderItem/orderItemResponse';
import { CartService } from '../../../services/Cart/cart-service';
import { NotificationService } from '../../../services/Notification/notification-service';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';
import { BindingTypeEnum } from '../../../models/Enums/bindingTypeEnum';
import { ConfirmModal } from '../../../components/confirm-modal/confirm-modal';
import CartResponse from '../../../models/Cart/cartResponse';
import CartWithItemsResponse from '../../../models/Cart/cartWithItemsResponse';
import { PaymentStatusEnum } from '../../../models/Enums/paymentStatusEnum';
import { PaymentService } from '../../../services/Payment/payment-service';

type PendingAction = {
  execute: () => void;
  message: string;
  subMessage?: string;
  cancel?: () => void;
};

@Component({
  standalone: true,
  imports: [CommonModule, ConfirmModal],
  templateUrl: './admin-order-detail.html',
  styleUrls: ['./admin-order-detail.css']
})
export class AdminOrderDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private cartsApi = inject(CartService);
  private notification = inject(NotificationService);
  private location = inject(Location);
  private paymentService = inject(PaymentService);

  cart = signal<CartWithItemsResponse | null>(null);

  isLoading = false;
  isUpdating = false;
  notFound = false;

  pendingAction: PendingAction | null = null;
  showConfirm = false;

  orderStatusEnum = OrderStatusEnum;
  protected readonly object = Object;

  message = '';

  // para que el select vuelva a su estado original al cancelar
  @ViewChild('statusSelect') statusSelect!: ElementRef<HTMLSelectElement>;

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading = true;
    this.notFound = false;

    this.cartsApi.getCartItems(id).subscribe({
      next: (data: CartWithItemsResponse) => {
        this.cart.set(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading order detail:', err);
        if (err?.status === 404) {
          this.notFound = true;
        } else {
          this.notification.error('Error al cargar el pedido.');
        }
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  fileName(file: any): string {
    if (typeof file === 'string') return file.split('/').pop() || file;
    return 'Archivo';
  }

  sub(it: OrderItem): number {
    return Number(it.amount || 0) * Number(it.copies || 1);
  }

  track = (_: number, it: OrderItem) => it.id;

  yesNo(v?: boolean): string {
    return v ? 'Sí' : 'No';
  }

  bindingLabel(v: BindingTypeEnum | string | undefined): string {
    const value = v?.toString();

    switch (value) {
      case 'RINGED':   return 'Anillado';
      case 'STAPLED':  return 'Abrochado';
      case 'NONE':     return 'Ninguno';
      default:         return '-';
    }
  }

  private openConfirmModal(action: PendingAction): void {
    this.pendingAction = action;
    this.message = action.message;
    this.showConfirm = true;
  }

  onStatusChange(newStatus: string): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;

    const statusEnum = newStatus as OrderStatusEnum;
    this.message = `¿Confirmar cambio de estado a: ${this.statusLabel(statusEnum)}?`;

    const action: PendingAction = {
      execute: () => this.updateStatus(cartId, statusEnum),
      message: this.message,
      cancel: () => {
        if (this.statusSelect) {
          this.statusSelect.nativeElement.value = this.cart()?.status || '';
        }
      }
    };

    if (statusEnum == OrderStatusEnum.READY){
      action.subMessage = 'Se le enviará una notificación al usuario';
    }

    if ([OrderStatusEnum.READY, OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED].includes(statusEnum)) {
      this.openConfirmModal(action);
    } else {
      action.execute();
    }
  }

  onApprovePaymentManual(): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;
    
    this.openConfirmModal({
      message: '¿Estás seguro de que deseas marcar este pedido como pagado?',
      execute: () => {
        this.paymentService.updatePaymentStatus(cartId, { status: PaymentStatusEnum.APPROVED }).subscribe({
          next: () => {
            this.notification.success('Pago aprobado manualmente');
            this.loadDetail();
          },
          error: () => {
            this.notification.error('Error al aprobar pago');
          }
        });
      }
    });
  }

  confirmChangeStatus(): void {
    if (this.pendingAction) {
      this.pendingAction.execute();
    }
    this.closeModal();
  }

  cancelChangeStatus(): void {
    if (this.pendingAction?.cancel) {
      this.pendingAction.cancel();
    }
    this.closeModal();
  }

  private closeModal(): void {
    this.showConfirm = false;
    this.pendingAction = null;
  }

  updateStatus(cartId: string, status: OrderStatusEnum): void {
    this.isUpdating = true;

    this.cartsApi.actualizarEstado(cartId, { status }).subscribe({
      next: (resp: CartResponse) => {
        this.cart.update(current => {
          if (!current) return null;
          return {
            ...resp,
            paymentMethod: current.paymentMethod,
            paymentStatus: current.paymentStatus,         
            items: current.items
          };
        });
        this.notification.success(`Pedido actualizado a ${this.statusLabel(status)}`);

        // Simulación de guardado para la UI
        setTimeout(() => this.isUpdating = false, 1000);
      },
      error: (err) => {
        this.isUpdating = false;
        console.error('Error updating status', err);
        if (err?.status === 404) {
          this.notFound = true;
        } else {
          this.notification.error('No se pudo actualizar el estado.');

          this.loadDetail();
        }
      }
    });
  }

  statusLabel(v: string | null): string {
    if (!v) return '-';
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

  public paymentStatusMap: { [key: string]: string } = {
    'PENDING': 'Pago Pendiente',
    'APPROVED': 'Pago Aprobado',
    'REJECTED': 'Pago Rechazado',
    'CANCELLED': 'Pago Cancelado',
    'UNKNOWN': 'Pendiente de Pago',
  };

  public paymentMethodMap: { [key: string]: string } = {
    'CASH': 'Efectivo',
    'TRANSFER': 'Transferencia',
    'MERCADO_PAGO': 'Mercado Pago',
  };

  downloadFile(cartId: string | undefined, orderId: string, name?: string): void {
    if (!cartId) return;
    this.cartsApi.descargarArchivo(cartId, orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name || 'archivo';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading file', err);
        this.notification.error('No se pudo descargar el archivo.');
      }
    });
  }

}
