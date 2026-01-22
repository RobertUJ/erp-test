import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenCompraService } from '../../../core/services';
import { OrdenCompraListResponseDTO, EstadoOrden } from '../../../core/models';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p class="text-gray-600 mt-1">Manage purchase orders and track their status</p>
        </div>
        <a routerLink="/purchase-orders/new" class="btn-primary">
          + New Order
        </a>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="flex flex-wrap gap-4 items-center">
          <div>
            <label class="form-label">Filter by Status</label>
            <select
              class="form-input"
              [(ngModel)]="selectedStatus"
              (change)="loadOrders()"
            >
              <option value="">All Statuses</option>
              <option value="BORRADOR">Draft</option>
              <option value="CONFIRMADA">Confirmed</option>
              <option value="EN_PROCESO">In Process</option>
              <option value="ENTREGADA">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading">
          <div class="loading__spinner"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error-message">
          <p>{{ error() }}</p>
          <button (click)="loadOrders()">Try again</button>
        </div>
      }

      <!-- Orders Table -->
      @if (!loading() && !error()) {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
                <th>Confirmed</th>
                <th>Delivered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td class="font-medium text-blue-600">{{ order.numero_orden }}</td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-gray]="order.estado === 'BORRADOR'"
                      [class.badge-info]="order.estado === 'CONFIRMADA'"
                      [class.badge-warning]="order.estado === 'EN_PROCESO'"
                      [class.badge-success]="order.estado === 'ENTREGADA'"
                    >
                      {{ getStatusLabel(order.estado) }}
                    </span>
                  </td>
                  <td class="font-semibold">\${{ order.total }}</td>
                  <td>{{ formatDate(order.fecha_creacion) }}</td>
                  <td>{{ order.fecha_confirmacion ? formatDate(order.fecha_confirmacion) : '-' }}</td>
                  <td>{{ order.fecha_entrega ? formatDate(order.fecha_entrega) : '-' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <a [routerLink]="['/purchase-orders', order.id]" class="action-link action-link--primary">
                        View
                      </a>
                      @if (order.estado === 'BORRADOR') {
                        <a [routerLink]="['/purchase-orders', order.id, 'edit']" class="action-link action-link--primary">
                          Edit
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-8 text-gray-500">
                    No purchase orders found. Create your first order to get started.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Stats Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-card__label">Total Orders</p>
            <p class="stat-card__value stat-card__value--default">{{ orders().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Draft</p>
            <p class="stat-card__value stat-card__value--default">{{ countByStatus('BORRADOR') }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">In Process</p>
            <p class="stat-card__value stat-card__value--warning">{{ countByStatus('EN_PROCESO') }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Delivered</p>
            <p class="stat-card__value stat-card__value--success">{{ countByStatus('ENTREGADA') }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class PurchaseOrdersListComponent implements OnInit {
  private readonly orderService = inject(OrdenCompraService);

  orders = signal<OrdenCompraListResponseDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedStatus: EstadoOrden | '' = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = this.selectedStatus ? { estado: this.selectedStatus as EstadoOrden } : undefined;

    this.orderService.listar(params).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load purchase orders. Please check if the API is running.');
        this.loading.set(false);
        console.error('Error loading orders:', err);
      },
    });
  }

  getStatusLabel(status: EstadoOrden): string {
    const labels: Record<EstadoOrden, string> = {
      BORRADOR: 'Draft',
      CONFIRMADA: 'Confirmed',
      EN_PROCESO: 'In Process',
      ENTREGADA: 'Delivered',
    };
    return labels[status];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  countByStatus(status: EstadoOrden): number {
    return this.orders().filter((o) => o.estado === status).length;
  }
}
