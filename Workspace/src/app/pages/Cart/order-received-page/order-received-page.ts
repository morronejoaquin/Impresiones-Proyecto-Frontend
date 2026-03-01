import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-received',
  templateUrl: './order-received-page.html',
  styleUrls: ['./order-received-page.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OrderReceivedPage {
  orderId: string | null = null;
  paymentStatus: 'success' | 'failure' | 'pending' = 'success';
  paymentMethod: 'CASH' | 'TRANSFER' | 'MERCADO_PAGO' = 'CASH';
  mpPaymentId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Prioridad: external_reference (MP) o orderId (nuestro redirect manual)
      this.orderId = params['orderId'] || params['external_reference'];
      this.mpPaymentId = params['payment_id'];
      
      const status = params['collection_status'] || params['status'];

      const methodFromUrl = params['method'] as any;
      
      if (this.mpPaymentId || status) {
        this.paymentMethod = 'MERCADO_PAGO';
        
        // Mapeo preciso de estados de Mercado Pago
        switch (status) {
          case 'approved':
            this.paymentStatus = 'success';
            break;
          case 'rejected':
          case 'cancelled':
            this.paymentStatus = 'failure';
            break;
          case 'in_process':
          case 'pending':
            this.paymentStatus = 'pending';
            break;
          default:
            this.paymentStatus = 'success';
        }
      } else {
        this.paymentMethod = methodFromUrl || 'CASH';
        this.paymentStatus = 'success';
      }
    });
  }
}
