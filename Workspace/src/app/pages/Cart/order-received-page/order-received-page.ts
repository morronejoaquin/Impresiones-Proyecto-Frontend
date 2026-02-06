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
  paymentMethod: 'CASH' | 'MERCADO_PAGO' = 'CASH';
  mpPaymentId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Prioridad: external_reference (MP) o orderId (nuestro redirect manual)
      this.orderId = params['orderId'] || params['external_reference'];
      this.mpPaymentId = params['payment_id'];
      
      // Si existe payment_id, asumimos que viene de Mercado Pago
      if (this.mpPaymentId || params['collection_status']) {
        this.paymentMethod = 'MERCADO_PAGO';
        const status = params['collection_status'] || params['status'];
        
        if (status === 'rejected') this.paymentStatus = 'failure';
        else if (status === 'pending' || status === 'in_process') this.paymentStatus = 'pending';
        else this.paymentStatus = 'success';
      } else {
        // Si no hay datos de MP, es nuestro flujo de Efectivo
        this.paymentMethod = 'CASH';
        this.paymentStatus = 'success';
      }
    });
  }
}
