import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketSurtidoService } from '../../../core/services';
import { TicketSurtidoResponseDTO, EstadoTicket } from '../../../core/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Back Button -->
      <a routerLink="/tickets" class="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tickets
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

      <!-- Ticket Details -->
      @if (ticket() && !loading()) {
        <div class="grid grid-cols-1 gap-6">
          <!-- Header Card -->
          <div class="card">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ ticket()!.numero_ticket }}</h1>
                <p class="text-gray-600 mt-1">
                  Order:
                  <a [routerLink]="['/purchase-orders', ticket()!.orden_compra_id]" class="text-primary hover:underline">
                    {{ ticket()!.numero_orden || 'N/A' }}
                  </a>
                </p>
              </div>
              <span
                class="badge"
                [class.badge-warning]="ticket()!.estado === 'PENDIENTE'"
                [class.badge-info]="ticket()!.estado === 'EN_SURTIDO'"
                [class.badge-success]="ticket()!.estado === 'COMPLETADO'"
              >
                {{ getEstadoLabel(ticket()!.estado) }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-sm text-gray-500">Total Items</p>
                <p class="text-xl font-bold text-gray-900">{{ ticket()!.items.length }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Units</p>
                <p class="text-xl font-bold text-gray-900">{{ getTotalUnidades() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Created</p>
                <p class="text-lg font-semibold">{{ formatDate(ticket()!.fecha_generacion) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Completed</p>
                <p class="text-lg font-semibold">{{ ticket()!.fecha_completado ? formatDate(ticket()!.fecha_completado!) : '-' }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              @if (ticket()!.estado === 'PENDIENTE') {
                <button (click)="startFulfillment()" class="btn-primary" [disabled]="actionLoading()">
                  {{ actionLoading() ? 'Processing...' : 'Start Fulfillment' }}
                </button>
              }
              @if (ticket()!.estado === 'EN_SURTIDO') {
                <button (click)="completeTicket()" class="btn-success" [disabled]="actionLoading()">
                  {{ actionLoading() ? 'Processing...' : 'Complete Ticket' }}
                </button>
              }
            </div>
          </div>

          <!-- Items Table -->
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">Items to Fulfill</h2>
            @if (ticket()!.items.length > 0) {
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>FIFO Locations</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of ticket()!.items; track item.numero_parte_codigo) {
                      <tr>
                        <td class="font-medium">
                          @if (item.numero_parte_id) {
                            <a [routerLink]="['/admin/part-numbers', item.numero_parte_id]" class="text-primary hover:underline">
                              {{ item.numero_parte_codigo }}
                            </a>
                          } @else {
                            <span class="text-primary">{{ item.numero_parte_codigo }}</span>
                          }
                        </td>
                        <td>{{ item.numero_parte_descripcion }}</td>
                        <td>
                          <span class="badge badge-info">{{ item.cantidad }}</span>
                        </td>
                        <td>
                          @if (item.ubicaciones_fifo && item.ubicaciones_fifo.length > 0) {
                            <div class="space-y-1">
                              @for (ubicacion of item.ubicaciones_fifo; track ubicacion.ubicacion_id) {
                                <div class="text-sm bg-gray-100 rounded px-2 py-1">
                                  <span class="font-medium">Location #{{ ubicacion.ubicacion_id }}</span>:
                                  <span class="text-primary">{{ ubicacion.cantidad }} units</span>
                                  <span class="text-gray-500 text-xs ml-2">({{ formatDateShort(ubicacion.fecha_ingreso) }})</span>
                                </div>
                              }
                            </div>
                          } @else {
                            <span class="text-gray-400">No locations</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-gray-500 text-center py-8">No items in this ticket.</p>
            }
          </div>

          <!-- Timeline -->
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">Timeline</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div>
                  <p class="font-medium">Generated</p>
                  <p class="text-sm text-gray-500">{{ formatDateTime(ticket()!.fecha_generacion) }}</p>
                </div>
              </div>
              @if (ticket()!.estado === 'EN_SURTIDO' || ticket()!.estado === 'COMPLETADO') {
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p class="font-medium">In Progress</p>
                    <p class="text-sm text-gray-500">Ticket fulfillment in progress</p>
                  </div>
                </div>
              }
              @if (ticket()!.fecha_completado) {
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-green-600"></div>
                  <div>
                    <p class="font-medium">Completed</p>
                    <p class="text-sm text-gray-500">{{ formatDateTime(ticket()!.fecha_completado!) }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketSurtidoService);

  ticket = signal<TicketSurtidoResponseDTO | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTicket(+id);
    }
  }

  loadTicket(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.ticketService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.ticket.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load ticket.');
        this.loading.set(false);
        console.error('Error loading ticket:', err);
      },
    });
  }

  getEstadoLabel(estado: EstadoTicket): string {
    const labels: Record<EstadoTicket, string> = {
      PENDIENTE: 'Pending',
      EN_SURTIDO: 'In Progress',
      COMPLETADO: 'Completed',
    };
    return labels[estado];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatDateShort(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }

  getTotalUnidades(): number {
    return this.ticket()?.items.reduce((sum, item) => sum + item.cantidad, 0) || 0;
  }

  startFulfillment(): void {
    if (!this.ticket()) return;
    this.actionLoading.set(true);

    this.ticketService.actualizarEstado(this.ticket()!.id, { estado: 'EN_SURTIDO' }).subscribe({
      next: (data) => {
        this.ticket.set(data);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error starting fulfillment:', err);
      },
    });
  }

  completeTicket(): void {
    if (!this.ticket()) return;
    this.actionLoading.set(true);

    this.ticketService.completarTicket(this.ticket()!.id).subscribe({
      next: (data) => {
        this.ticket.set(data);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error completing ticket:', err);
      },
    });
  }
}
