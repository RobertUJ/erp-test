import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CedisService } from '../../../core/services';
import { CedisUbicacionResponseDTO, CreateCedisDTO } from '../../../core/models';

/**
 * Component for managing CEDIS (Distribution Centers)
 */
@Component({
  selector: 'app-cedis-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">CEDIS Management</h1>
          <p class="text-gray-600 mt-1">Manage distribution centers</p>
        </div>
        <button (click)="showCreateModal.set(true)" class="btn-primary">
          + New CEDIS
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ error() }}</p>
          <button (click)="loadCedis()" class="mt-2 text-sm text-red-600 hover:text-red-800">
            Try again
          </button>
        </div>
      }

      <!-- CEDIS Grid -->
      @if (!loading() && !error()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (cedis of cedisList(); track cedis.id) {
            <div class="card hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-semibold text-gray-900">{{ cedis.nombre }}</h3>
                <div class="flex gap-2">
                  <button
                    (click)="editCedis(cedis)"
                    class="text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    (click)="deleteCedis(cedis)"
                    class="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p class="text-gray-600 text-sm mt-2">{{ cedis.direccion }}</p>

              <div class="mt-4 space-y-2 text-sm">
                @if (cedis.telefono) {
                  <div class="flex items-center gap-2 text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{{ cedis.telefono }}</span>
                  </div>
                }
                @if (cedis.email) {
                  <div class="flex items-center gap-2 text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{{ cedis.email }}</span>
                  </div>
                }
              </div>

              <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">Locations</span>
                  <span class="badge badge-info">{{ cedis.ubicaciones.length }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No CEDIS</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by creating a new distribution center.</p>
            </div>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreateModal() || editingCedis()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">
                {{ editingCedis() ? 'Edit CEDIS' : 'Create New CEDIS' }}
              </h2>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label class="form-label">Name *</label>
                  <input type="text" formControlName="nombre" class="form-input" placeholder="CEDIS name" />
                </div>

                <div>
                  <label class="form-label">Address *</label>
                  <textarea formControlName="direccion" class="form-input" rows="2" placeholder="Full address"></textarea>
                </div>

                <div>
                  <label class="form-label">Phone</label>
                  <input type="tel" formControlName="telefono" class="form-input" placeholder="Phone number" />
                </div>

                <div>
                  <label class="form-label">Email</label>
                  <input type="email" formControlName="email" class="form-input" placeholder="email@example.com" />
                </div>

                @if (formError()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p class="text-red-800 text-sm">{{ formError() }}</p>
                  </div>
                }

                <div class="flex gap-3 pt-4">
                  <button
                    type="submit"
                    class="btn-primary flex-1"
                    [disabled]="form.invalid || submitting()"
                  >
                    {{ submitting() ? 'Saving...' : (editingCedis() ? 'Update' : 'Create') }}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    (click)="closeModal()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (deletingCedis()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 class="text-xl font-semibold mb-2">Delete CEDIS</h2>
            <p class="text-gray-600 mb-4">
              Are you sure you want to delete "{{ deletingCedis()!.nombre }}"? This will also delete all locations within this CEDIS.
            </p>
            <div class="flex gap-3">
              <button
                (click)="confirmDelete()"
                class="btn-danger flex-1"
                [disabled]="submitting()"
              >
                {{ submitting() ? 'Deleting...' : 'Delete' }}
              </button>
              <button
                (click)="deletingCedis.set(null)"
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
export class CedisListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cedisService = inject(CedisService);

  cedisList = signal<CedisUbicacionResponseDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  showCreateModal = signal(false);
  editingCedis = signal<CedisUbicacionResponseDTO | null>(null);
  deletingCedis = signal<CedisUbicacionResponseDTO | null>(null);
  submitting = signal(false);
  formError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    telefono: ['', [Validators.maxLength(15)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.loadCedis();
  }

  loadCedis(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cedisService.listarCedis(0, 100).subscribe({
      next: (data) => {
        this.cedisList.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load CEDIS. Please check if the API is running.');
        this.loading.set(false);
        console.error('Error loading CEDIS:', err);
      },
    });
  }

  editCedis(cedis: CedisUbicacionResponseDTO): void {
    this.editingCedis.set(cedis);
    this.form.patchValue({
      nombre: cedis.nombre,
      direccion: cedis.direccion,
      telefono: cedis.telefono || '',
      email: cedis.email || '',
    });
  }

  deleteCedis(cedis: CedisUbicacionResponseDTO): void {
    this.deletingCedis.set(cedis);
  }

  closeModal(): void {
    this.showCreateModal.set(false);
    this.editingCedis.set(null);
    this.form.reset();
    this.formError.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.formError.set(null);

    const formValue = this.form.value;
    const dto: CreateCedisDTO = {
      nombre: formValue.nombre,
      direccion: formValue.direccion,
      telefono: formValue.telefono || undefined,
      email: formValue.email || undefined,
    };

    const request = this.editingCedis()
      ? this.cedisService.actualizarCedis(this.editingCedis()!.id, dto)
      : this.cedisService.crearCedis(dto);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadCedis();
      },
      error: (err) => {
        this.submitting.set(false);
        this.formError.set(err.error?.detail || 'Operation failed. Please try again.');
        console.error('Error saving CEDIS:', err);
      },
    });
  }

  confirmDelete(): void {
    if (!this.deletingCedis()) return;

    this.submitting.set(true);

    this.cedisService.eliminarCedis(this.deletingCedis()!.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deletingCedis.set(null);
        this.loadCedis();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Error deleting CEDIS:', err);
      },
    });
  }
}
