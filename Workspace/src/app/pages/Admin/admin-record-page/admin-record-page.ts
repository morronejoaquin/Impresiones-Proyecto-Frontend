import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/Cart/cart-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import CartWithItemsResponse from '../../../models/Cart/cartWithItemsResponse';
import Page from '../../../models/PageModel/page';
import CartResponse from '../../../models/Cart/cartResponse';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-record-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-record-page.html',
  styleUrl: './admin-record-page.css'
})

export class AdminRecordPage implements OnInit {
  deliveredCarts: CartResponse[] = [];
  currentPage = 0;
  pageSize = 15;
  totalElements = 0;
  isLoading = false;
  noResults = false;

  filters = {
    customerEmail: '',
    startDate: '',
    endDate: ''
  };

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.noResults = false;
    
    this.cartService.getDeliveredHistory(this.filters, this.currentPage, this.pageSize).subscribe({
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

  applyFilters(): void {
    this.currentPage = 0;
    this.loadHistory();
  }

  clearFilters(): void {
    this.filters = { startDate: '', endDate: '' , customerEmail: ''};
    this.currentPage = 0;
    this.loadHistory();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.customerEmail || this.filters.startDate || this.filters.endDate);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goToDetail(cart: CartResponse) {
    this.router.navigate(['/admin/order', cart.id]);
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
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }
}
