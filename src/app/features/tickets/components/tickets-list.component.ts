import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketSurtidoService } from '../../../core/services';
import { TicketSurtidoResponseDTO, EstadoTicket } from '../../../core/models';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__title">
          <h1>Fulfillment Tickets</h1>
          <p>Manage tickets generated for purchase orders</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="filter-bar">
          <div class="filter-bar__group">
            <label class="form-label">Status</label>
            <select [(ngModel)]="estadoFilter" (change)="loadTickets()" class="form-input">
              <option value="">All</option>
              <option value="PENDIENTE">Pending</option>
              <option value="EN_SURTIDO">In Progress</option>
              <option value="COMPLETADO">Completed</option>
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
          <button (click)="loadTickets()" class="btn-primary">Retry</button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error()) {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Order</th>
                <th>Status</th>
                <th>Items</th>
                <th>Created</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of tickets(); track ticket.id) {
                <tr>
                  <td class="font-medium text-primary">{{ ticket.numero_ticket }}</td>
                  <td>
                    <a [routerLink]="['/purchase-orders', ticket.orden_compra_id]" class="text-primary hover:underline">
                      {{ ticket.numero_orden || '-' }}
                    </a>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-warning]="ticket.estado === 'PENDIENTE'"
                      [class.badge-info]="ticket.estado === 'EN_SURTIDO'"
                      [class.badge-success]="ticket.estado === 'COMPLETADO'"
                    >
                      {{ getEstadoLabel(ticket.estado) }}
                    </span>
                  </td>
                  <td>{{ ticket.items.length }}</td>
                  <td>{{ formatDate(ticket.fecha_generacion) }}</td>
                  <td>{{ ticket.fecha_completado ? formatDate(ticket.fecha_completado) : '-' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <a [routerLink]="['/tickets', ticket.id]" class="action-link action-link--primary">
                        View
                      </a>
                      @if (ticket.estado === 'PENDIENTE') {
                        <button
                          (click)="startFulfillment(ticket)"
                          class="action-link action-link--primary"
                          [disabled]="actionLoading()"
                        >
                          Start
                        </button>
                      }
                      @if (ticket.estado === 'EN_SURTIDO') {
                        <button
                          (click)="completeTicket(ticket)"
                          class="action-link action-link--success"
                          [disabled]="actionLoading()"
                        >
                          Complete
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-8 text-gray-500">
                    No tickets available.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Stats Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-card__label">Total Tickets</p>
            <p class="stat-card__value stat-card__value--default">{{ tickets().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Pending</p>
            <p class="stat-card__value stat-card__value--warning">{{ pendingCount() }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">In Progress</p>
            <p class="stat-card__value stat-card__value--info">{{ inProgressCount() }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Completed</p>
            <p class="stat-card__value stat-card__value--success">{{ completedCount() }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class TicketsListComponent implements OnInit {
  private readonly ticketService = inject(TicketSurtidoService);

  tickets = signal<TicketSurtidoResponseDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal(false);

  estadoFilter: EstadoTicket | '' = '';

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = this.estadoFilter ? { estado: this.estadoFilter as EstadoTicket } : undefined;

    this.ticketService.listar(params).subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load tickets. Please check if the API is running.');
        this.loading.set(false);
        console.error('Error loading tickets:', err);
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
    return new Date(dateString).toLocaleString();
  }

  startFulfillment(ticket: TicketSurtidoResponseDTO): void {
    this.actionLoading.set(true);

    this.ticketService.actualizarEstado(ticket.id, { estado: 'EN_SURTIDO' }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadTickets();
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error starting fulfillment:', err);
      },
    });
  }

  completeTicket(ticket: TicketSurtidoResponseDTO): void {
    this.actionLoading.set(true);

    this.ticketService.completarTicket(ticket.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadTickets();
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('Error completing ticket:', err);
      },
    });
  }

  pendingCount(): number {
    return this.tickets().filter((t) => t.estado === 'PENDIENTE').length;
  }

  inProgressCount(): number {
    return this.tickets().filter((t) => t.estado === 'EN_SURTIDO').length;
  }

  completedCount(): number {
    return this.tickets().filter((t) => t.estado === 'COMPLETADO').length;
  }
}
