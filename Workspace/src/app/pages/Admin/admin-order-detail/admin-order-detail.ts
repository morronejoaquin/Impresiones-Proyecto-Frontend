import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import Cart from '../../../models/Cart/cart';
import OrderItem from '../../../models/OrderItem/orderItem';
import { CartService } from '../../../services/Cart/cart-service';
import { OrderService } from '../../../services/Orders/order-service';

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

  cart = signal<Cart | null>(null);
  items = signal<OrderItem[]>([]);
  total = signal<number>(0);

  ngOnInit(): void {
    
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

bindingLabel(v?: 'ringed' | 'stapled' | 'unringed'): string {
  switch (v) {
    case 'ringed':   return 'Anillado';
    case 'stapled':  return 'Abrochado';
    case 'unringed': return 'Sin anillar';
    default:         return '-';
  }
}

}
