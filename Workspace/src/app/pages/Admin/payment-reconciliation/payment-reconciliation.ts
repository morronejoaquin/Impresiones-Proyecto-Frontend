import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartEvent, ActiveElement } from 'chart.js';
import { AdminDashboardService } from '../../../services/Dashboard/admin-dashboard.service';
import { PaymentSummaryByMethod } from '../../../models/Dashboard/paymentSummaryByMethod';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-reconciliation',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './payment-reconciliation.html',
  styleUrl: './payment-reconciliation.css',
})
export class PaymentReconciliationComponent implements OnInit, OnDestroy {
  paymentData: PaymentSummaryByMethod[] = [];
  totalCollected: number = 0;
  cashTotal: number = 0;
  mercadoPagoTotal: number = 0;
  loading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Chart data
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderColor: ['#36A2EB', '#FF6384'],
        borderWidth: 2,
      },
    ],
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = '$' + context.parsed.toFixed(2);
            const total = this.totalCollected;
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadPaymentData();
  }

  loadPaymentData(): void {
    this.loading = true;
    this.error = null;
    this.adminDashboardService
      .getPaymentSummaryByMethod()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paymentData = data;
          this.calculateTotals();
          this.updateChart();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading payment data:', err);
          this.error = 'Error loading payment reconciliation data';
          this.loading = false;
        },
      });
  }

  calculateTotals(): void {
    this.totalCollected = 0;
    this.cashTotal = 0;
    this.mercadoPagoTotal = 0;

    this.paymentData.forEach((payment) => {
      this.totalCollected += payment.totalAmount;
      if (payment.paymentMethod === 'CASH') {
        this.cashTotal = payment.totalAmount;
      } else if (payment.paymentMethod === 'MERCADO_PAGO') {
        this.mercadoPagoTotal = payment.totalAmount;
      }
    });
  }

  updateChart(): void {
    if (this.paymentData.length === 0) {
      this.pieChartData.labels = [];
      this.pieChartData.datasets[0].data = [];
      return;
    }

    const labels = this.paymentData.map((p) => this.formatMethod(p.paymentMethod));
    const amounts = this.paymentData.map((p) => parseFloat(p.totalAmount.toFixed(2)));

    this.pieChartData.labels = labels;
    this.pieChartData.datasets[0].data = amounts;
  }

  formatMethod(method: string): string {
    if (method === 'CASH') {
      return 'Efectivo';
    } else if (method === 'MERCADO_PAGO') {
      return 'Mercado Pago';
    }
    return method;
  }

  getCssClassName(method: string): string {
    if (method === 'CASH') {
      return 'cash';
    } else if (method === 'MERCADO_PAGO') {
      return 'mercado-pago';
    }
    return method.toLowerCase();
  }

  getCashTransactionCount(): number {
    const cashPayment = this.paymentData.find((p) => p.paymentMethod === 'CASH');
    return cashPayment ? cashPayment.transactionCount : 0;
  }

  getCashPercentage(): string {
    const cashPayment = this.paymentData.find((p) => p.paymentMethod === 'CASH');
    return cashPayment ? cashPayment.percentage.toFixed(1) : '0';
  }

  getMercadoPagoTransactionCount(): number {
    const mpPayment = this.paymentData.find((p) => p.paymentMethod === 'MERCADO_PAGO');
    return mpPayment ? mpPayment.transactionCount : 0;
  }

  getMercadoPagoPercentage(): string {
    const mpPayment = this.paymentData.find((p) => p.paymentMethod === 'MERCADO_PAGO');
    return mpPayment ? mpPayment.percentage.toFixed(1) : '0';
  }

  refreshData(): void {
    this.loadPaymentData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
