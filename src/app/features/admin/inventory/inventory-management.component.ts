import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CedisService, InventarioService, NumeroParteService } from '../../../core/services';
import {
  CedisUbicacionResponseDTO,
  UbicacionesResponseDTO,
  UbicacionConInventarioDTO,
  NumeroParteResponseDTO,
  AsignarInventarioDTO,
} from '../../../core/models';

/**
 * Component for managing inventory by location
 */
@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p class="text-gray-600 mt-1">Manage inventory by location</p>
        </div>
      </div>

      <!-- Selectors -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Select CEDIS</label>
            <select
              class="form-input"
              [value]="selectedCedisId() || ''"
              (change)="onCedisChange($event)"
            >
              <option value="">-- Select a distribution center --</option>
              @for (cedis of cedisList(); track cedis.id) {
                <option [value]="cedis.id">{{ cedis.nombre }}</option>
              }
            </select>
          </div>

          <div>
            <label class="form-label">Select Location</label>
            <select
              class="form-input"
              [value]="selectedLocationId() || ''"
              (change)="onLocationChange($event)"
              [disabled]="!selectedCedisId()"
            >
              <option value="">-- Select a location --</option>
              @for (loc of locations(); track loc.id) {
                <option [value]="loc.id">{{ loc.codigo }} - {{ loc.descripcion }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Selected Location Info -->
      @if (locationInventory() && !loading()) {
        <div class="space-y-6">
          <!-- Location Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="card">
              <p class="text-sm text-gray-600">Location Code</p>
              <p class="text-xl font-bold text-gray-900">{{ locationInventory()!.ubicacion_codigo }}</p>
            </div>
            <div class="card">
              <p class="text-sm text-gray-600">Capacity</p>
              <p class="text-xl font-bold text-gray-900">{{ locationInventory()!.capacidad }}</p>
            </div>
            <div class="card">
              <p class="text-sm text-gray-600">Current Occupancy</p>
              <p class="text-xl font-bold" [class.text-green-600]="locationInventory()!.ocupacion_actual < locationInventory()!.capacidad * 0.8"
                 [class.text-yellow-600]="locationInventory()!.ocupacion_actual >= locationInventory()!.capacidad * 0.8 && locationInventory()!.ocupacion_actual < locationInventory()!.capacidad"
                 [class.text-red-600]="locationInventory()!.ocupacion_actual >= locationInventory()!.capacidad">
                {{ locationInventory()!.ocupacion_actual }}
              </p>
            </div>
            <div class="card">
              <p class="text-sm text-gray-600">Available</p>
              <p class="text-xl font-bold text-blue-600">{{ locationInventory()!.disponible }}</p>
            </div>
          </div>

          <!-- Add Inventory Button -->
          <div class="flex justify-end">
            <button (click)="showAddModal.set(true)" class="btn-primary">
              + Add Inventory
            </button>
          </div>

          <!-- Products Table -->
          <div class="table-container bg-white">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (product of locationInventory()!.productos; track product.inventario_id) {
                  <tr>
                    <td class="font-medium text-blue-600">{{ product.numero_parte_codigo }}</td>
                    <td>{{ product.numero_parte_descripcion }}</td>
                    <td>
                      <span class="badge badge-info">{{ product.cantidad }}</span>
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button
                          (click)="editInventory(product)"
                          class="action-link action-link--primary"
                        >
                          Update Qty
                        </button>
                        <button
                          (click)="removeInventory(product)"
                          class="action-link action-link--danger"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                      No inventory in this location. Add products to get started.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (!selectedLocationId() && !loading()) {
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Select a Location</h3>
          <p class="mt-1 text-sm text-gray-500">Choose a CEDIS and location to manage inventory.</p>
        </div>
      }

      <!-- Add Inventory Modal -->
      @if (showAddModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">Add Inventory</h2>

              <form [formGroup]="addForm" (ngSubmit)="onAddSubmit()" class="space-y-4">
                <div>
                  <label class="form-label">Part Number *</label>
                  <select formControlName="numero_parte_id" class="form-input">
                    <option value="">-- Select a part number --</option>
                    @for (part of partNumbers(); track part.id) {
                      <option [value]="part.id">{{ part.codigo }} - {{ part.descripcion }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="form-label">Quantity *</label>
                  <input
                    type="number"
                    formControlName="cantidad"
                    class="form-input"
                    min="1"
                    placeholder="Enter quantity"
                  />
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
                    [disabled]="addForm.invalid || submitting()"
                  >
                    {{ submitting() ? 'Adding...' : 'Add Inventory' }}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    (click)="closeAddModal()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Update Quantity Modal -->
      @if (editingInventory()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">Update Quantity</h2>
              <p class="text-gray-600 mb-4">
                {{ editingInventory()!.numero_parte_codigo }} - {{ editingInventory()!.numero_parte_descripcion }}
              </p>

              <form [formGroup]="updateForm" (ngSubmit)="onUpdateSubmit()" class="space-y-4">
                <div>
                  <label class="form-label">New Quantity *</label>
                  <input
                    type="number"
                    formControlName="cantidad"
                    class="form-input"
                    min="0"
                    placeholder="Enter new quantity"
                  />
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
                    [disabled]="updateForm.invalid || submitting()"
                  >
                    {{ submitting() ? 'Updating...' : 'Update' }}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    (click)="editingInventory.set(null); formError.set(null)"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Remove Confirmation Modal -->
      @if (removingInventory()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 class="text-xl font-semibold mb-2">Remove from Location</h2>
            <p class="text-gray-600 mb-4">
              Are you sure you want to remove "{{ removingInventory()!.numero_parte_codigo }}" from this location?
            </p>
            <div class="flex gap-3">
              <button
                (click)="confirmRemove()"
                class="btn-danger flex-1"
                [disabled]="submitting()"
              >
                {{ submitting() ? 'Removing...' : 'Remove' }}
              </button>
              <button
                (click)="removingInventory.set(null)"
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
export class InventoryManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cedisService = inject(CedisService);
  private readonly inventarioService = inject(InventarioService);
  private readonly partNumberService = inject(NumeroParteService);

  cedisList = signal<CedisUbicacionResponseDTO[]>([]);
  locations = signal<UbicacionesResponseDTO[]>([]);
  partNumbers = signal<NumeroParteResponseDTO[]>([]);
  locationInventory = signal<UbicacionConInventarioDTO | null>(null);

  selectedCedisId = signal<number | null>(null);
  selectedLocationId = signal<number | null>(null);

  loading = signal(false);
  submitting = signal(false);
  formError = signal<string | null>(null);

  showAddModal = signal(false);
  editingInventory = signal<{ inventario_id: number; numero_parte_codigo: string; numero_parte_descripcion: string; cantidad: number } | null>(null);
  removingInventory = signal<{ inventario_id: number; numero_parte_codigo: string } | null>(null);

  addForm: FormGroup = this.fb.group({
    numero_parte_id: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
  });

  updateForm: FormGroup = this.fb.group({
    cantidad: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadCedisList();
    this.loadPartNumbers();
  }

  loadCedisList(): void {
    this.cedisService.listarCedis(0, 100).subscribe({
      next: (data) => this.cedisList.set(data),
      error: (err) => console.error('Error loading CEDIS:', err),
    });
  }

  loadPartNumbers(): void {
    this.partNumberService.listar({ activos_only: true }).subscribe({
      next: (data) => this.partNumbers.set(data),
      error: (err) => console.error('Error loading part numbers:', err),
    });
  }

  onCedisChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const cedisId = selectElement.value ? parseInt(selectElement.value, 10) : null;
    this.selectedCedisId.set(cedisId);
    this.selectedLocationId.set(null);
    this.locationInventory.set(null);

    if (cedisId) {
      const cedis = this.cedisList().find((c) => c.id === cedisId);
      this.locations.set(cedis?.ubicaciones || []);
    } else {
      this.locations.set([]);
    }
  }

  onLocationChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const locationId = selectElement.value ? parseInt(selectElement.value, 10) : null;
    this.selectedLocationId.set(locationId);

    if (locationId) {
      this.loadLocationInventory(locationId);
    } else {
      this.locationInventory.set(null);
    }
  }

  loadLocationInventory(locationId: number): void {
    this.loading.set(true);

    this.inventarioService.obtenerInventarioEnUbicacion(locationId).subscribe({
      next: (data) => {
        this.locationInventory.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error loading location inventory:', err);
      },
    });
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.addForm.reset({ cantidad: 1 });
    this.formError.set(null);
  }

  onAddSubmit(): void {
    if (this.addForm.invalid || !this.selectedLocationId()) return;

    this.submitting.set(true);
    this.formError.set(null);

    const formValue = this.addForm.value;
    const dto: AsignarInventarioDTO = {
      numero_parte_id: parseInt(formValue.numero_parte_id, 10),
      ubicacion_id: this.selectedLocationId()!,
      cantidad: formValue.cantidad,
    };

    this.inventarioService.asignarInventario(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAddModal();
        this.loadLocationInventory(this.selectedLocationId()!);
      },
      error: (err) => {
        this.submitting.set(false);
        this.formError.set(err.error?.error || err.error?.detail || 'Failed to add inventory. Please try again.');
        console.error('Error adding inventory:', err);
      },
    });
  }

  editInventory(product: { inventario_id: number; numero_parte_codigo: string; numero_parte_descripcion: string; cantidad: number }): void {
    this.editingInventory.set(product);
    this.updateForm.patchValue({ cantidad: product.cantidad });
  }

  onUpdateSubmit(): void {
    if (this.updateForm.invalid || !this.editingInventory()) return;

    this.submitting.set(true);
    this.formError.set(null);

    this.inventarioService
      .actualizarCantidad(this.editingInventory()!.inventario_id, {
        cantidad: this.updateForm.value.cantidad,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.editingInventory.set(null);
          this.loadLocationInventory(this.selectedLocationId()!);
        },
        error: (err) => {
          this.submitting.set(false);
          this.formError.set(err.error?.detail || 'Failed to update quantity. Please try again.');
          console.error('Error updating inventory:', err);
        },
      });
  }

  removeInventory(product: { inventario_id: number; numero_parte_codigo: string }): void {
    this.removingInventory.set(product);
  }

  confirmRemove(): void {
    if (!this.removingInventory()) return;

    this.submitting.set(true);

    this.inventarioService.removerDeUbicacion(this.removingInventory()!.inventario_id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.removingInventory.set(null);
        this.loadLocationInventory(this.selectedLocationId()!);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Error removing inventory:', err);
      },
    });
  }
}
