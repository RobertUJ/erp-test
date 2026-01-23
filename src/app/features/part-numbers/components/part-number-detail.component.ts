import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NumeroParteService, InventarioService } from '../../../core/services';
import { NumeroParteResponseDTO, UbicacionDelProductoDTO } from '../../../core/models';

/**
 * Component for displaying detailed information about a part number
 */
@Component({
  selector: 'app-part-number-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Back Button -->
      <a routerLink="/admin/part-numbers" class="inline-flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Part Numbers
      </a>

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
        </div>
      }

      <!-- Part Number Details -->
      @if (partNumber() && !loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Info Card -->
          <div class="lg:col-span-2 card">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ partNumber()!.codigo }}</h1>
                <p class="text-gray-600 mt-1">{{ partNumber()!.descripcion }}</p>
              </div>
              <span
                class="badge"
                [class.badge-success]="partNumber()!.activo"
                [class.badge-gray]="!partNumber()!.activo"
              >
                {{ partNumber()!.activo ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-sm text-gray-500">Price</p>
                <p class="text-lg font-semibold">\${{ partNumber()!.precio }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Unit</p>
                <p class="text-lg font-semibold">{{ partNumber()!.unidad_medida }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Stock</p>
                <p
                  class="text-lg font-semibold"
                  [class.text-green-600]="partNumber()!.stock > 10"
                  [class.text-yellow-600]="partNumber()!.stock > 0 && partNumber()!.stock <= 10"
                  [class.text-red-600]="partNumber()!.stock === 0"
                >
                  {{ partNumber()!.stock }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Locations</p>
                <p class="text-lg font-semibold">{{ locations().length }}</p>
              </div>
            </div>

            <hr class="my-6" />

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Created</p>
                <p class="text-gray-900">{{ formatDate(partNumber()!.created_at) }}</p>
              </div>
              <div>
                <p class="text-gray-500">Last Updated</p>
                <p class="text-gray-900">{{ formatDate(partNumber()!.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Stock Status Card -->
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">Stock Status</h2>
            <div class="space-y-4">
              @if (partNumber()!.stock === 0) {
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span class="font-medium text-red-800">Out of Stock</span>
                  </div>
                  <p class="text-sm text-red-600 mt-2">This part number has no inventory available.</p>
                </div>
              } @else if (partNumber()!.stock <= 10) {
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span class="font-medium text-yellow-800">Low Stock</span>
                  </div>
                  <p class="text-sm text-yellow-600 mt-2">Stock is running low. Consider reordering.</p>
                </div>
              } @else {
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="font-medium text-green-800">In Stock</span>
                  </div>
                  <p class="text-sm text-green-600 mt-2">Stock levels are healthy.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Locations Table -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Inventory Locations</h2>
          @if (loadingLocations()) {
            <div class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          } @else if (locations().length > 0) {
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Location Code</th>
                    <th>CEDIS</th>
                    <th>Quantity</th>
                    <th>Fecha Ingreso</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (loc of locations(); track loc.inventario_id) {
                    <tr>
                      <td class="font-medium">{{ loc.ubicacion_codigo }}</td>
                      <td>{{ loc.cedis_nombre || 'N/A' }}</td>
                      <td>
                        <span class="badge badge-info">{{ loc.cantidad }}</span>
                      </td>
                      <td>{{ formatDate(loc.fecha_ingreso) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-gray-500 text-center py-8">No inventory assigned to any location yet.</p>
          }
        </div>
      }
    </div>
  `,
})
export class PartNumberDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly partNumberService = inject(NumeroParteService);
  private readonly inventarioService = inject(InventarioService);

  partNumber = signal<NumeroParteResponseDTO | null>(null);
  locations = signal<UbicacionDelProductoDTO[]>([]);
  loading = signal(false);
  loadingLocations = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPartNumber(+id);
    }
  }

  loadPartNumber(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.partNumberService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.partNumber.set(data);
        this.loading.set(false);
        this.loadLocations(id);
      },
      error: (err) => {
        this.error.set('Failed to load part number details.');
        this.loading.set(false);
        console.error('Error loading part number:', err);
      },
    });
  }

  loadLocations(partNumberId: number): void {
    this.loadingLocations.set(true);

    this.inventarioService.obtenerUbicacionesDeProducto(partNumberId).subscribe({
      next: (data) => {
        this.locations.set(data);
        this.loadingLocations.set(false);
      },
      error: (err) => {
        this.loadingLocations.set(false);
        console.error('Error loading locations:', err);
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
