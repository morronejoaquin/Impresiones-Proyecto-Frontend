import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import Cart from '../../../models/Cart/cartResponse';
import OrderItem from '../../../models/OrderItem/orderItemResponse';
import { CartService } from '../../../services/Cart/cart-service';
import { OrderService } from '../../../services/Orders/order-service';
import { NotificationService } from '../../../services/Notification/notification-service';
import { OrderStatusEnum } from '../../../models/Enums/orderStatusEnum';
import { BindingTypeEnum } from '../../../models/Enums/bindingTypeEnum';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-order-detail.html',
  styleUrls: ['./admin-order-detail.css']
})
export class AdminOrderDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private cartsApi = inject(CartService);
  private ordersApi = inject(OrderService);
  private notification = inject(NotificationService);

  cart = signal<Cart | null>(null);
  items = signal<OrderItem[]>([]);
  total = signal<number>(0);
  isLoading = false;
  isUpdating = false;
  notFound = false;

  // confirmation modal
  statusToConfirm: OrderStatusEnum | null = null;
  showConfirm = false;

  orderStatusEnum = OrderStatusEnum;

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
      case 'ringed':   return 'Anillado';
      case 'stapled':  return 'Abrochado';
      case 'none':     return 'Ninguno';
      default:         return '-';
    }
  }

  onStatusChange(newStatus: string): void {
    const cartId = this.cart()?.id;
    if (!cartId) return;

    // If the new status requires confirmation
    if (newStatus === OrderStatusEnum.READY || newStatus === OrderStatusEnum.DELIVERED || newStatus === OrderStatusEnum.CANCELED) {
      this.statusToConfirm = newStatus as OrderStatusEnum;
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
    // reload to revert UI select to actual status
    this.loadDetail();
  }

  updateStatus(cartId: string, status: OrderStatusEnum): void {
    this.isUpdating = true;

    this.cartsApi.actualizarEstado(cartId, { status }).subscribe({
      next: (resp) => {
        this.isUpdating = false;
        this.cart.set(resp);
        this.notification.success('Estado actualizado a ' + status);
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
