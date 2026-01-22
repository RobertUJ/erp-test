import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumeroParteService } from '../../../core/services';
import { NumeroParteResponseDTO, UnidadMedida } from '../../../core/models';

/**
 * Admin component for managing part numbers with full CRUD operations
 */
@Component({
  selector: 'app-admin-part-numbers',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Manage Part Numbers</h1>
          <p class="text-gray-600 mt-1">Create, edit, and manage all part numbers</p>
        </div>
        <button (click)="showCreateModal.set(true)" class="btn-primary">
          + New Part Number
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
          <button (click)="loadPartNumbers()" class="mt-2 text-sm text-red-600 hover:text-red-800">
            Try again
          </button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error()) {
        <div class="table-container bg-white">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Description</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (part of partNumbers(); track part.id) {
                <tr>
                  <td class="text-gray-500">{{ part.id }}</td>
                  <td class="font-medium text-blue-600">{{ part.codigo }}</td>
                  <td>{{ part.descripcion }}</td>
                  <td>\${{ part.precio }}</td>
                  <td>{{ part.unidad_medida }}</td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-success]="part.activo"
                      [class.badge-gray]="!part.activo"
                    >
                      {{ part.activo ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <a
                        [routerLink]="['/admin/part-numbers', part.id]"
                        class="action-link action-link--primary"
                      >
                        View
                      </a>
                      <button
                        (click)="editPartNumber(part)"
                        class="action-link action-link--primary"
                      >
                        Edit
                      </button>
                      @if (part.activo) {
                        <button
                          (click)="deactivatePartNumber(part)"
                          class="action-link action-link--danger"
                        >
                          Deactivate
                        </button>
                      } @else {
                        <button
                          (click)="activatePartNumber(part)"
                          class="action-link action-link--success"
                        >
                          Activate
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-8 text-gray-500">
                    No part numbers found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreateModal() || editingPartNumber()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">
                {{ editingPartNumber() ? 'Edit Part Number' : 'Create Part Number' }}
              </h2>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label class="form-label">Code *</label>
                  <input
                    type="text"
                    formControlName="codigo"
                    class="form-input"
                    placeholder="PART-001"
                    [readonly]="!!editingPartNumber()"
                  />
                </div>

                <div>
                  <label class="form-label">Description *</label>
                  <textarea
                    formControlName="descripcion"
                    class="form-input"
                    rows="2"
                    placeholder="Part description"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Price</label>
                    <input
                      type="number"
                      formControlName="precio"
                      class="form-input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label class="form-label">Unit</label>
                    <select formControlName="unidad_medida" class="form-input">
                      @for (unit of units; track unit) {
                        <option [value]="unit">{{ unit }}</option>
                      }
                    </select>
                  </div>
                </div>

                @if (editingPartNumber()) {
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      formControlName="activo"
                      id="activo"
                      class="w-4 h-4 text-blue-600 rounded"
                    />
                    <label for="activo" class="text-sm text-gray-700">Active</label>
                  </div>
                }

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
                    {{ submitting() ? 'Saving...' : (editingPartNumber() ? 'Update' : 'Create') }}
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

      <!-- Deactivate Confirmation Modal -->
      @if (deactivatingPartNumber()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 class="text-xl font-semibold mb-2">Deactivate Part Number</h2>
            <p class="text-gray-600 mb-4">
              Are you sure you want to deactivate "{{ deactivatingPartNumber()!.codigo }}"?
            </p>
            <div class="flex gap-3">
              <button
                (click)="confirmDeactivate()"
                class="btn-danger flex-1"
                [disabled]="submitting()"
              >
                {{ submitting() ? 'Deactivating...' : 'Deactivate' }}
              </button>
              <button
                (click)="deactivatingPartNumber.set(null)"
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
export class AdminPartNumbersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly partNumberService = inject(NumeroParteService);

  partNumbers = signal<NumeroParteResponseDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  showCreateModal = signal(false);
  editingPartNumber = signal<NumeroParteResponseDTO | null>(null);
  deactivatingPartNumber = signal<NumeroParteResponseDTO | null>(null);
  submitting = signal(false);
  formError = signal<string | null>(null);

  units: UnidadMedida[] = ['PZA', 'KG', 'LT', 'MT', 'CJA'];

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    precio: ['0.00'],
    unidad_medida: ['PZA'],
    activo: [true],
  });

  ngOnInit(): void {
    this.loadPartNumbers();
  }

  loadPartNumbers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.partNumberService.listar().subscribe({
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

  editPartNumber(part: NumeroParteResponseDTO): void {
    this.editingPartNumber.set(part);
    this.form.patchValue({
      codigo: part.codigo,
      descripcion: part.descripcion,
      precio: part.precio,
      unidad_medida: part.unidad_medida,
      activo: part.activo,
    });
  }

  deactivatePartNumber(part: NumeroParteResponseDTO): void {
    this.deactivatingPartNumber.set(part);
  }

  activatePartNumber(part: NumeroParteResponseDTO): void {
    this.submitting.set(true);

    this.partNumberService.actualizar(part.id, { activo: true }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.loadPartNumbers();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Error activating part number:', err);
      },
    });
  }

  closeModal(): void {
    this.showCreateModal.set(false);
    this.editingPartNumber.set(null);
    this.form.reset({
      precio: '0.00',
      unidad_medida: 'PZA',
      activo: true,
    });
    this.formError.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.formError.set(null);

    const formValue = this.form.value;

    if (this.editingPartNumber()) {
      this.partNumberService
        .actualizar(this.editingPartNumber()!.id, {
          descripcion: formValue.descripcion,
          precio: formValue.precio?.toString(),
          unidad_medida: formValue.unidad_medida,
          activo: formValue.activo,
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.closeModal();
            this.loadPartNumbers();
          },
          error: (err) => {
            this.submitting.set(false);
            this.formError.set(err.error?.detail || 'Update failed. Please try again.');
            console.error('Error updating part number:', err);
          },
        });
    } else {
      this.partNumberService
        .crear({
          codigo: formValue.codigo,
          descripcion: formValue.descripcion,
          precio: formValue.precio?.toString() || '0.00',
          unidad_medida: formValue.unidad_medida,
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.closeModal();
            this.loadPartNumbers();
          },
          error: (err) => {
            this.submitting.set(false);
            this.formError.set(err.error?.detail || 'Creation failed. Please try again.');
            console.error('Error creating part number:', err);
          },
        });
    }
  }

  confirmDeactivate(): void {
    if (!this.deactivatingPartNumber()) return;

    this.submitting.set(true);

    this.partNumberService.desactivar(this.deactivatingPartNumber()!.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deactivatingPartNumber.set(null);
        this.loadPartNumbers();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Error deactivating part number:', err);
      },
    });
  }
}
