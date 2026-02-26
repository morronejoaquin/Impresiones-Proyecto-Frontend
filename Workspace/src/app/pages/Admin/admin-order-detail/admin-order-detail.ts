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

  cart = signal<CartResponse | null>(null);
  items = signal<OrderItem[]>([]);
  total = signal<number>(0);
  isLoading = false;
  isUpdating = false;
  notFound = false;

  statusToConfirm: OrderStatusEnum | null = null;
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

    forkJoin({
      cart: this.cartsApi.getById(id),
      items: this.cartsApi.getOrdersByCart(id)
    }).subscribe({
      next: ({ cart, items }) => {
        this.cart.set(cart);
        this.items.set(items || []);
        this.total.set((items || []).reduce((s: number, it: any) => s + (it.amount || 0), 0));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading cart detail:', err);
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

  onStatusChange(newStatus: string): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;

    this.statusToConfirm = newStatus as OrderStatusEnum;
    this.message = `¿Confirmar cambio de estado a: ${this.statusLabel(this.statusToConfirm)}?`;

    if (newStatus === OrderStatusEnum.READY || newStatus === OrderStatusEnum.DELIVERED || newStatus === OrderStatusEnum.CANCELLED) {
      this.showConfirm = true;
      return;
    }

    this.updateStatus(cartId, newStatus as OrderStatusEnum);
  }

  confirmChangeStatus(): void {
    const cartId = this.cart()?.id;
    if (!cartId || !this.statusToConfirm) return;

    this.showConfirm = false;
    this.updateStatus(cartId, this.statusToConfirm);
    this.statusToConfirm = null;
  }

  cancelChangeStatus(): void {
    this.showConfirm = false;
    this.statusToConfirm = null;

    if (this.statusSelect) {
      this.statusSelect.nativeElement.value = this.cart()?.status || '';
    }
    
    this.loadDetail();
  }

  updateStatus(cartId: string, status: OrderStatusEnum): void {
    this.isUpdating = true;

    this.cartsApi.actualizarEstado(cartId, { status }).subscribe({
      next: (resp) => {
        this.cart.set(resp);
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
          // reload to reflect backend state
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
