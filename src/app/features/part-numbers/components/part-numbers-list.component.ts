import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NumeroParteService } from '../../../core/services';
import { NumeroParteResponseDTO } from '../../../core/models';

@Component({
  selector: 'app-part-numbers-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header__title">
          <h1>Part Numbers</h1>
          <p>View and manage all part numbers in the system</p>
        </div>
        <a routerLink="/part-numbers/new" class="btn btn--primary">
          + New Part Number
        </a>
      </div>

      <!-- Filters -->
      <div class="card">
        <div class="filter-bar">
          <div class="filter-bar__search">
            <input
              type="text"
              placeholder="Search by code or description..."
              class="form-input"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            />
          </div>
          <div class="form-checkbox">
            <input
              type="checkbox"
              id="activeOnly"
              [(ngModel)]="activeOnly"
              (change)="loadPartNumbers()"
            />
            <label for="activeOnly">Active only</label>
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
          <button (click)="loadPartNumbers()">Try again</button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error()) {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (part of partNumbers(); track part.id) {
                <tr>
                  <td class="text-primary font-medium">{{ part.codigo }}</td>
                  <td>{{ part.descripcion }}</td>
                  <td>
                    <span
                      class="badge"
                      [class.badge--success]="part.stock > 10"
                      [class.badge--warning]="part.stock > 0 && part.stock <= 10"
                      [class.badge--danger]="part.stock === 0"
                    >
                      {{ part.stock }}
                    </span>
                  </td>
                  <td>\${{ part.precio }}</td>
                  <td>{{ part.unidad_medida }}</td>
                  <td>
                    <span
                      class="badge"
                      [class.badge--success]="part.activo"
                      [class.badge--gray]="!part.activo"
                    >
                      {{ part.activo ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ formatDate(part.created_at) }}</td>
                  <td>
                    <div class="actions">
                      <a [routerLink]="['/part-numbers', part.id]" class="link link--primary">
                        View
                      </a>
                      <a [routerLink]="['/part-numbers', part.id, 'edit']" class="link link--gray">
                        Edit
                      </a>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    No part numbers found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Stats Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-card__label">Total Parts</p>
            <p class="stat-card__value stat-card__value--default">{{ partNumbers().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Active Parts</p>
            <p class="stat-card__value stat-card__value--success">{{ activeParts() }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Low Stock</p>
            <p class="stat-card__value stat-card__value--warning">{{ lowStockParts() }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Out of Stock</p>
            <p class="stat-card__value stat-card__value--danger">{{ outOfStockParts() }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class PartNumbersListComponent implements OnInit {
  private readonly partNumberService = inject(NumeroParteService);

  partNumbers = signal<NumeroParteResponseDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  searchQuery = '';
  activeOnly = false;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadPartNumbers();
  }

  loadPartNumbers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.partNumberService
      .listar({
        activos_only: this.activeOnly,
        q: this.searchQuery || undefined,
      })
      .subscribe({
        next: (data) => {
          this.partNumbers.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load part numbers. Please check if the API is running.');
          this.loading.set(false);
          console.error('Error loading part numbers:', err);
        },
      });
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadPartNumbers();
    }, 300);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  activeParts(): number {
    return this.partNumbers().filter((p) => p.activo).length;
  }

  lowStockParts(): number {
    return this.partNumbers().filter((p) => p.stock > 0 && p.stock <= 10).length;
  }

  outOfStockParts(): number {
    return this.partNumbers().filter((p) => p.stock === 0).length;
  }
}
