import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../../services/Dashboard/admin-dashboard.service';
import { OrderSummaryByStatus } from '../../../models/Dashboard/orderSummaryByStatus';
import { PrintingStatistics } from '../../../models/Dashboard/printingStatistics';
import { PaymentSummaryByMethod } from '../../../models/Dashboard/paymentSummaryByMethod';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  orderSummary: OrderSummaryByStatus[] = [];
  printingStats: PrintingStatistics | null = null;
  paymentSummary: PaymentSummaryByMethod[] = [];
  loading = true;
  error: string | null = null;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    let completedRequests = 0;
    const totalRequests = 3;

    this.dashboardService.getOrdersSummaryByStatus().subscribe({
      next: (data) => {
        this.orderSummary = data;
        completedRequests++;
        if (completedRequests === totalRequests) this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar resumen de pedidos';
        console.error(err);
        completedRequests++;
        if (completedRequests === totalRequests) this.loading = false;
      },
    });

    this.dashboardService.getPrintingStatistics().subscribe({
      next: (data) => {
        this.printingStats = data;
        completedRequests++;
        if (completedRequests === totalRequests) this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar estadísticas de impresión';
        console.error(err);
        completedRequests++;
        if (completedRequests === totalRequests) this.loading = false;
      },
    });

    this.dashboardService.getPaymentSummaryByMethod().subscribe({
      next: (data) => {
        this.paymentSummary = data;
        completedRequests++;
        if (completedRequests === totalRequests) this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar resumen de pagos';
        console.error(err);
        completedRequests++;
        if (completedRequests === totalRequests) this.loading = false;
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'Pendiente',
      PRINTING: 'Imprimiendo',
      BINDING: 'Anillando',
      READY: 'Listo',
      DELIVERED: 'Entregado',
      CANCELED: 'Cancelado',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      PENDING: '#ff9800',
      PRINTING: '#2196f3',
      BINDING: '#9c27b0',
      READY: '#4caf50',
      DELIVERED: '#00bcd4',
      CANCELED: '#f44336',
    };
    return colors[status] || '#999';
  }
}
