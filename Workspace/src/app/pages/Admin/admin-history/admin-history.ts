import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/Cart/cart-service';
import CartResponse from '../../../models/Cart/cartResponse';
import Page from '../../../models/PageModel/page';

interface HistoryFilters {
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-admin-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-history.html',
  styleUrl: './admin-history.css'
})
export class AdminHistoryComponent implements OnInit {
  deliveredCarts: CartResponse[] = [];
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  isLoading = false;
  noResults = false;

  filters: HistoryFilters = {
    startDate: '',
    endDate: ''
  };

  statusColorMap: { [key: string]: string } = {
    'DELIVERED': '#4CAF50'
  };

  statusLabelMap: { [key: string]: string } = {
    'DELIVERED': 'ENTREGADO'
  };

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadHistory();
  }

  clearFilters(): void {
    this.filters = {
      startDate: '',
      endDate: ''
    };
    this.currentPage = 0;
    this.loadHistory();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.startDate || this.filters.endDate);
  }

  loadHistory(): void {
    this.isLoading = true;
    this.noResults = false;

    const filterParams = this.buildFilterParams();
    this.cartService.getDeliveredHistory(filterParams, this.currentPage, this.pageSize).subscribe({
      next: (response: Page<CartResponse>) => {
        this.deliveredCarts = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.noResults = this.deliveredCarts.length === 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isLoading = false;
      }
    });
  }

  private buildFilterParams(): any {
    const params: any = {};
    
    if (this.filters.startDate) {
      params.startDate = this.filters.startDate;
    }
    if (this.filters.endDate) {
      params.endDate = this.filters.endDate;
    }
    
    return params;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalElements) {
      this.currentPage++;
      this.loadHistory();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHistory();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }
}
