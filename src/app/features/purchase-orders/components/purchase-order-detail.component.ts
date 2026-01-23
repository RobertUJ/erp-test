import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdenCompraService, TicketSurtidoService } from '../../../core/services';
import { OrdenCompraResponseDTO, EstadoOrden, TicketSurtidoResponseDTO } from '../../../core/models';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Back Button -->
      <a routerLink="/purchase-orders" class="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Purchase Orders
      </a>

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
        </div>
      }

      <!-- Order Details -->
      @if (order() && !loading()) {
        <div class="grid grid-cols-1 gap-6">
          <!-- Header Card -->
          <div class="card">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ order()!.numero_orden }}</h1>
                <p class="text-gray-600 mt-1">{{ order()!.observaciones || 'No observations' }}</p>
              </div>
              <span
                class="badge"
                [class.badge-gray]="order()!.estado === 'BORRADOR'"
                [class.badge-info]="order()!.estado === 'CONFIRMADA'"
                [class.badge-warning]="order()!.estado === 'EN_PROCESO'"
                [class.badge-success]="order()!.estado === 'ENTREGADA'"
              >
                {{ getStatusLabel(order()!.estado) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p class="text-sm text-gray-500">Total</p>
                <p class="text-xl font-bold text-gray-900">\${{ order()!.total }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Items</p>
                <p class="text-xl font-bold text-gray-900">{{ order()!.items.length }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Created</p>
                <p class="text-lg font-semibold">{{ formatDate(order()!.fecha_creacion) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Status Date</p>
                <p class="text-lg font-semibold">{{ getStatusDate() }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              @if (order()!.estado === 'BORRADOR') {
                <button (click)="confirmarOrden()" class="btn-primary" [disabled]="actionLoading()">
                  {{ actionLoading() ? 'Processing...' : 'Confirm Order' }}
                </button>
                <a [routerLink]="['/purchase-orders', order()!.id, 'edit']" class="btn-secondary">
                  Edit Order
                </a>
                <button (click)="showDeleteConfirm.set(true)" class="btn-danger">
                  Delete
                </button>
              }
              @if (order()!.estado === 'CONFIRMADA') {
                <button (click)="procesarOrden()" class="btn-primary" [disabled]="actionLoading()">
                  {{ actionLoading() ? 'Processing...' : 'Start Processing' }}
                </button>
              }
              @if (order()!.estado === 'EN_PROCESO' || order()!.estado === 'ENTREGADA') {
                <div class="mt-2">
                   @if (orderTickets().length > 0) {
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span class="text-yellow-800">
                        Check your tickets and process your order.
                      </span>
                      @for (ticket of orderTickets(); track ticket.id) {
                        <a
                          [routerLink]="['/tickets', ticket.id]"
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          {{ ticket.numero_ticket }}
                        </a>
                      }
                    </div>
                  } @else {
                    <a routerLink="/tickets" class="text-green-600 ">
                      Order Delivered  - Go to Tickets
                    </a>
                  }
                </div>
              }

            </div>
          </div>

          <!-- Items Table -->
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">Order Items</h2>
            @if (order()!.items.length > 0) {
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Part Number</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of order()!.items; track item.id) {
                      <tr>
                        <td class="font-medium text-blue-600">
                          @if (item.numero_parte_id) {
                            <a [routerLink]="['/admin/part-numbers', item.numero_parte_id]" class="text-primary hover:underline">
                              {{item.numero_parte_codigo}}
                            </a>
                          } @else {
                            <span class="text-primary">{{ item.numero_parte_codigo }}</span>
                          }
                        </td>
                        <td>{{ item.numero_parte_descripcion }}</td>
                        <td>{{ item.cantidad }}</td>
                        <td>\${{ item.precio_unitario }}</td>
                        <td class="font-semibold">\${{ item.subtotal }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="bg-gray-50">
                      <td colspan="4" class="text-right font-semibold">Total:</td>
                      <td class="font-bold text-lg">\${{ order()!.total }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            } @else {
              <p class="text-gray-500 text-center py-8">No items in this order.</p>
            }
          </div>

          <!-- Timeline -->
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">Order Timeline</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p class="font-medium">Created</p>
                  <p class="text-sm text-gray-500">{{ formatDateTime(order()!.fecha_creacion) }}</p>
                </div>
              </div>
              @if (order()!.fecha_confirmacion) {
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p class="font-medium">Confirmed</p>
                    <p class="text-sm text-gray-500">{{ formatDateTime(order()!.fecha_confirmacion!) }}</p>
                  </div>
                </div>
              }
              @if (order()!.fecha_entrega) {
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-green-600"></div>
                  <div>
                    <p class="font-medium">Delivered</p>
                    <p class="text-sm text-gray-500">{{ formatDateTime(order()!.fecha_entrega!) }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 class="text-xl font-semibold mb-2">Delete Order</h2>
            <p class="text-gray-600 mb-4">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button
                (click)="eliminarOrden()"
                class="btn-danger flex-1"
                [disabled]="actionLoading()"
              >
                {{ actionLoading() ? 'Deleting...' : 'Delete' }}
              </button>
              <button
                (click)="showDeleteConfirm.set(false)"
                class="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PurchaseOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrdenCompraService);
  private readonly ticketService = inject(TicketSurtidoService);

  order = signal<OrdenCompraResponseDTO | null>(null);
  orderTickets = signal<TicketSurtidoResponseDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal(false);
  showDeleteConfirm = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(+id);
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loading.set(false);
        // Load tickets if order is in process
        if (data.estado === 'EN_PROCESO') {
          this.loadOrderTickets(data.id);
        }
      },
      error: (err) => {
        this.error.set('Failed to load order details.');
        this.loading.set(false);
        console.error('Error loading order:', err);
      },
    });
  }

  loadOrderTickets(orderId: number): void {
    this.ticketService.obtenerPorOrdenId(orderId).subscribe({
      next: (tickets) => {
        this.orderTickets.set(tickets);
      },
      error: (err) => {
        console.error('Error loading order tickets:', err);
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

  getStatusDate(): string {
    const order = this.order();
    if (!order) return '-';

    if (order.fecha_entrega) {
      return this.formatDate(order.fecha_entrega);
    }
    if (order.fecha_confirmacion) {
      return this.formatDate(order.fecha_confirmacion);
    }
    return this.formatDate(order.fecha_creacion);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  confirmarOrden(): void {
    if (!this.order()) return;
    this.actionLoading.set(true);

    this.orderService.confirmar(this.order()!.id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error confirming order:', err);
      },
    });
  }

  procesarOrden(): void {
    if (!this.order()) return;
    this.actionLoading.set(true);

    this.orderService.procesar(this.order()!.id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.actionLoading.set(false);
        // Load tickets after processing
        this.loadOrderTickets(data.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error processing order:', err);
      },
    });
  }
  eliminarOrden(): void {
    if (!this.order()) return;
    this.actionLoading.set(true);

    this.orderService.eliminar(this.order()!.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.router.navigate(['/purchase-orders']);
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error deleting order:', err);
      },
    });
  }
}
