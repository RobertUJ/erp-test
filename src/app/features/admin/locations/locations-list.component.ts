import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CedisService } from '../../../core/services';
import {
  CedisUbicacionResponseDTO,
  UbicacionesResponseDTO,
  AgregarUbicacionDTO,
} from '../../../core/models';

/**
 * Component for managing locations within CEDIS
 */
@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Locations Management</h1>
          <p class="text-gray-600 mt-1">Manage storage locations within distribution centers</p>
        </div>
      </div>

      <!-- CEDIS Selector -->
      <div class="card">
        <label class="form-label">Select CEDIS</label>
        <select
          class="form-input max-w-md"
          [value]="selectedCedisId()"
          (change)="onCedisChange($event)"
        >
          <option value="">-- Select a distribution center --</option>
          @for (cedis of cedisList(); track cedis.id) {
            <option [value]="cedis.id">{{ cedis.nombre }}</option>
          }
        </select>
      </div>

      <!-- Loading State -->
      @if (loadingCedis()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Locations Section -->
      @if (selectedCedis()) {
        <div class="space-y-4">
          <!-- Selected CEDIS Info -->
          <div class="card bg-blue-50 border-blue-200">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-blue-900">{{ selectedCedis()!.nombre }}</h3>
                <p class="text-sm text-blue-700">{{ selectedCedis()!.direccion }}</p>
              </div>
              <button (click)="showCreateModal.set(true)" class="btn-primary">
                + Add Location
              </button>
            </div>
          </div>

          <!-- Loading Locations -->
          @if (loadingLocations()) {
            <div class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }

          <!-- Locations Table -->
          @if (!loadingLocations()) {
            <div class="table-container bg-white">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Rack</th>
                    <th>Level</th>
                    <th>Container</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (loc of locations(); track loc.id) {
                    <tr>
                      <td class="font-medium text-blue-600">{{ loc.codigo }}</td>
                      <td>{{ loc.descripcion }}</td>
                      <td>{{ loc.rack }}</td>
                      <td>{{ loc.nivel }}</td>
                      <td>{{ loc.contenedor }}</td>
                      <td>
                        <span class="badge badge-info">{{ loc.capacidad }}</span>
                      </td>
                      <td>
                        <div class="flex gap-2">
                          <button
                            (click)="editLocation(loc)"
                            class="action-link action-link--primary"
                          >
                            Edit
                          </button>
                          <button
                            (click)="deleteLocation(loc)"
                            class="action-link action-link--danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center py-8 text-gray-500">
                        No locations in this CEDIS. Add your first location.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      @if (!selectedCedis() && !loadingCedis()) {
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Select a CEDIS</h3>
          <p class="mt-1 text-sm text-gray-500">Choose a distribution center to manage its locations.</p>
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreateModal() || editingLocation()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">
                {{ editingLocation() ? 'Edit Location' : 'Add New Location' }}
              </h2>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Code *</label>
                    <input type="text" formControlName="codigo" class="form-input" placeholder="LOC-001" />
                  </div>
                  <div>
                    <label class="form-label">Capacity *</label>
                    <input type="number" formControlName="capacidad" class="form-input" placeholder="100" min="0" />
                  </div>
                </div>

                <div>
                  <label class="form-label">Description *</label>
                  <input type="text" formControlName="descripcion" class="form-input" placeholder="Location description" />
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="form-label">Rack *</label>
                    <input type="text" formControlName="rack" class="form-input" placeholder="A1" />
                  </div>
                  <div>
                    <label class="form-label">Level *</label>
                    <input type="text" formControlName="nivel" class="form-input" placeholder="1" />
                  </div>
                  <div>
                    <label class="form-label">Container *</label>
                    <input type="text" formControlName="contenedor" class="form-input" placeholder="BIN-01" />
                  </div>
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
                    {{ submitting() ? 'Saving...' : (editingLocation() ? 'Update' : 'Create') }}
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
      @if (deletingLocation()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 class="text-xl font-semibold mb-2">Delete Location</h2>
            <p class="text-gray-600 mb-4">
              Are you sure you want to delete location "{{ deletingLocation()!.codigo }}"?
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
                (click)="deletingLocation.set(null)"
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
export class LocationsListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cedisService = inject(CedisService);

  cedisList = signal<CedisUbicacionResponseDTO[]>([]);
  selectedCedisId = signal<number | null>(null);
  selectedCedis = signal<CedisUbicacionResponseDTO | null>(null);
  locations = signal<UbicacionesResponseDTO[]>([]);

  loadingCedis = signal(false);
  loadingLocations = signal(false);

  showCreateModal = signal(false);
  editingLocation = signal<UbicacionesResponseDTO | null>(null);
  deletingLocation = signal<UbicacionesResponseDTO | null>(null);
  submitting = signal(false);
  formError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    rack: ['', [Validators.required, Validators.maxLength(100)]],
    nivel: ['', [Validators.required, Validators.maxLength(100)]],
    contenedor: ['', [Validators.required, Validators.maxLength(100)]],
    capacidad: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadCedisList();
  }

  loadCedisList(): void {
    this.loadingCedis.set(true);

    this.cedisService.listarCedis(0, 100).subscribe({
      next: (data) => {
        this.cedisList.set(data);
        this.loadingCedis.set(false);
      },
      error: (err) => {
        this.loadingCedis.set(false);
        console.error('Error loading CEDIS:', err);
      },
    });
  }

  onCedisChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const cedisId = selectElement.value ? parseInt(selectElement.value, 10) : null;
    this.selectedCedisId.set(cedisId);

    if (cedisId) {
      this.loadCedisDetails(cedisId);
    } else {
      this.selectedCedis.set(null);
      this.locations.set([]);
    }
  }

  loadCedisDetails(cedisId: number): void {
    this.loadingLocations.set(true);

    this.cedisService.obtenerCedis(cedisId).subscribe({
      next: (data) => {
        this.selectedCedis.set(data);
        this.locations.set(data.ubicaciones);
        this.loadingLocations.set(false);
      },
      error: (err) => {
        this.loadingLocations.set(false);
        console.error('Error loading CEDIS details:', err);
      },
    });
  }

  editLocation(location: UbicacionesResponseDTO): void {
    this.editingLocation.set(location);
    this.form.patchValue({
      codigo: location.codigo,
      descripcion: location.descripcion,
      rack: location.rack,
      nivel: location.nivel,
      contenedor: location.contenedor,
      capacidad: location.capacidad,
    });
  }

  deleteLocation(location: UbicacionesResponseDTO): void {
    this.deletingLocation.set(location);
  }

  closeModal(): void {
    this.showCreateModal.set(false);
    this.editingLocation.set(null);
    this.form.reset({ capacidad: 0 });
    this.formError.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedCedisId()) return;

    this.submitting.set(true);
    this.formError.set(null);

    const formValue = this.form.value;
    const dto: AgregarUbicacionDTO = {
      codigo: formValue.codigo,
      descripcion: formValue.descripcion,
      rack: formValue.rack,
      nivel: formValue.nivel,
      contenedor: formValue.contenedor,
      capacidad: formValue.capacidad,
    };

    const cedisId = this.selectedCedisId()!;
    const request = this.editingLocation()
      ? this.cedisService.actualizarUbicacion(cedisId, this.editingLocation()!.id, dto)
      : this.cedisService.crearUbicacion(cedisId, dto);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadCedisDetails(cedisId);
      },
      error: (err) => {
        this.submitting.set(false);
        this.formError.set(err.error?.detail || 'Operation failed. Please try again.');
        console.error('Error saving location:', err);
      },
    });
  }

  confirmDelete(): void {
    if (!this.deletingLocation() || !this.selectedCedisId()) return;

    this.submitting.set(true);

    this.cedisService
      .eliminarUbicacion(this.selectedCedisId()!, this.deletingLocation()!.id)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.deletingLocation.set(null);
          this.loadCedisDetails(this.selectedCedisId()!);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error deleting location:', err);
        },
      });
  }
}
