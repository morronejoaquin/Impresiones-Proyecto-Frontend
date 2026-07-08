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
      
      // Manejo de parámetros de estado
      const statusFromParam = params['status'] || params['collection_status'];
      const methodFromParam = params['method'];

      if (this.mpPaymentId || statusFromParam || methodFromParam === 'MERCADO_PAGO') {
        this.paymentMethod = 'MERCADO_PAGO';
        this.updateMercadoPagoStatus(statusFromParam);
      } else {
        // Solo aca se manejan los manuales
        this.paymentMethod = methodFromParam === 'TRANSFER' ? 'TRANSFER' : 'CASH';
        this.paymentStatus = 'success';
      }
    });
  }

  private updateMercadoPagoStatus(status: string): void {
    switch (status) {
      case 'success':
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
        this.paymentStatus = 'pending';
    }
  }

  async copyToClipboard(fullId: string | null) {
    if (!fullId) return;

    const textToCopy = fullId.substring(0, 16);
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  }
}
