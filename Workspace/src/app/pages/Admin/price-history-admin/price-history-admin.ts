import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import { BaseChartDirective } from 'ng2-charts';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-price-history-admin',
  imports: [BaseChartDirective, RouterLink],
  templateUrl: './price-history-admin.html',
  styleUrl: './price-history-admin.css',
})
export class PriceHistoryAdmin implements OnInit{
  
  loading = true;
  errorType: 'NONE' | 'CONNECTION' | 'NO_DATA' = 'NONE';

  private pricesHistory: any[] = [];

  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Hoja B/N', backgroundColor: '#42A5F5', borderColor: '#42A5F5', fill: false },
      { data: [], label: 'Hoja Color', backgroundColor: '#66BB6A', borderColor: '#66BB6A', fill: false },
      { data: [], label: 'Anillado', backgroundColor: '#FFA726', borderColor: '#FFA726', fill: false },
      { data: [], label: 'Abrochado', backgroundColor: '#AB47BC', borderColor: '#AB47BC', fill: false },
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const raw = context.raw;
            const datasetLabel = context.dataset.label || '';
            return `${datasetLabel}: $${raw}`;
          },
          footer: (tooltipItems: any) => {
            // Accedemos a la entidad original para obtener las fechas
            const index = tooltipItems[0].dataIndex;
            const entity = this.pricesHistory[index]; // Guardaremos el array completo
            const start = new Date(entity.validFrom).toLocaleDateString();
            const end = entity.validTo ? new Date(entity.validTo).toLocaleDateString() : 'Vigente';
            return `Válido: ${start} - ${end}`;
          }
        }
      }
    },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private priceService: PriceManagerService) {
  }

  ngOnInit(): void {
    this.loadHistoryPrices();
  }

  loadHistoryPrices(){
    this.loading = true;
    this.errorType = 'NONE';

    this.priceService.getPricesHistory().subscribe({
      next: (data: any) => {
        this.loading = false;

        if (!data || data.length === 0) {
          this.errorType = 'NO_DATA';
        } else {
          this.pricesHistory = data;
          // Asignación de datos
          this.lineChartData.labels = data.map((_: any, index: number) => `Precio. ${index + 1}`);
          this.lineChartData.datasets[0].data = data.map((d: any) => d.pricePerSheetBW);
          this.lineChartData.datasets[1].data = data.map((d: any) => d.pricePerSheetColor);
          this.lineChartData.datasets[2].data = data.map((d: any) => d.priceRingedBinding);
          this.lineChartData.datasets[3].data = data.map((d: any) => d.priceStapledBinding);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorType = 'CONNECTION';
      }
    });
  }
}
