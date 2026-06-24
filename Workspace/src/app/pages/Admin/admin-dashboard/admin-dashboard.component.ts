import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../../services/Dashboard/admin-dashboard.service';
import { PaymentSummaryByMethod } from '../../../models/Dashboard/paymentSummaryByMethod';
import AdminDashboardResponse from '../../../models/Dashboard/adminDashboardResponse';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
import { BaseChartDirective } from 'ng2-charts';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})

export class AdminDashboardComponent implements OnInit {
  dashboardData: AdminDashboardResponse | null = null;
  loading = true;
  errorType: 'NONE' | 'CONNECTION' = 'NONE';

  filters = {
    startDate: '',
    endDate: ''
  };
  
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ 
      data: [], 
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      hoverOffset: 4
    }]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorType = 'NONE';
    
    this.dashboardService.getDashboardData(this.filters).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.updateChart(data.paymentSummary);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorType = 'CONNECTION';
      }
    });
  }

  updateChart(payments: PaymentSummaryByMethod[]): void {

    const backgroundColors = payments.map(p => this.methodColors[p.paymentMethod] || '#CCCCCC');

    this.pieChartData = {
    ...this.pieChartData,
    labels: payments.map(p => this.formatMethod(p.paymentMethod)),
    datasets: [{
      ...this.pieChartData.datasets[0],
      data: payments.map(p => p.totalAmount),
      backgroundColor: backgroundColors
    }]
  };
  }

  applyFilters() {
    this.loadDashboardData();
  }

  clearFilters() {
    this.filters = { startDate: '', endDate: '' };
    this.loadDashboardData();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.startDate || this.filters.endDate);
  }

  formatMethod(paymentMethod: string): string{
    const methods: { [key: string]: string } = {
      CASH: 'Efectivo',
      TRANSFER: 'Transferencia',
      MERCADO_PAGO: 'Mercado Pago',
    };
    return methods[paymentMethod] || paymentMethod;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'Pendiente',
      PRINTING: 'Imprimiendo',
      BINDING: 'Anillando',
      READY: 'Listo',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
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

  private methodColors: { [key: string]: string } = {
  'MERCADO_PAGO': '#36A2EB',
  'TRANSFER': '#FF6384',
  'CASH': '#FFCE56'
};
}
