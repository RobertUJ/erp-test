import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdenCompraService, NumeroParteService } from '../../../core/services';
import { OrdenCompraResponseDTO, NumeroParteResponseDTO, OrdenCompraItemResponseDTO } from '../../../core/models';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/purchase-orders" class="text-gray-600 hover:text-gray-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode() ? 'Edit Order: ' + order()?.numero_orden : 'Create Purchase Order' }}
          </h1>
          <p class="text-gray-600">{{ isEditMode() ? 'Modify order details and items' : 'Create a new purchase order and add items' }}</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading">
          <div class="loading__spinner"></div>
        </div>
      }

      @if (!loading()) {
        <!-- Order Info Card -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Order Information</h2>
          <form [formGroup]="orderForm" (ngSubmit)="saveOrder()" class="space-y-4">
            <div>
              <label class="form-label">Observations</label>
              <textarea
                formControlName="observaciones"
                class="form-input"
                rows="3"
                placeholder="Optional notes for this order..."
              ></textarea>
            </div>

            @if (!isEditMode()) {
              <button type="submit" class="btn-primary" [disabled]="submitting()">
                {{ submitting() ? 'Creating...' : 'Create Order' }}
              </button>
            } @else {
              <button type="submit" class="btn-primary" [disabled]="submitting()">
                {{ submitting() ? 'Saving...' : 'Save Changes' }}
              </button>
            }
          </form>
        </div>

        <!-- Items Section (only for edit mode) -->
        @if (isEditMode() && order()) {
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Order Items</h2>
              <button (click)="showAddItemModal.set(true)" class="btn-primary">
                + Add Item
              </button>
            </div>

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
                      <th>Actions</th>
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
                        <td>
                          <div class="flex gap-2">
                            <button
                              (click)="editItem(item)"
                              class="action-link action-link--primary"
                            >
                              Edit
                            </button>
                            <button
                              (click)="confirmDeleteItem(item)"
                              class="action-link action-link--danger"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="bg-gray-50">
                      <td colspan="4" class="text-right font-semibold">Total:</td>
                      <td class="font-bold text-lg">\${{ order()!.total }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            } @else {
              <p class="text-gray-500 text-center py-8">No items yet. Add items to this order.</p>
            }
          </div>
        }
      }

      <!-- Add Item Modal -->
      @if (showAddItemModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">Add Item</h2>

              <form [formGroup]="itemForm" (ngSubmit)="addItem()" class="space-y-4">
                <div>
                  <label class="form-label">Part Number *</label>
                  <select formControlName="numero_parte_codigo" class="form-input">
                    <option value="">-- Select a part number --</option>
                    @for (part of partNumbers(); track part.id) {
                      <option [value]="part.codigo">{{ part.codigo }} - {{ part.descripcion }}</option>
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

                @if (itemError()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p class="text-red-800 text-sm">{{ itemError() }}</p>
                  </div>
                }

                <div class="flex gap-3 pt-4">
                  <button
                    type="submit"
                    class="btn-primary flex-1"
                    [disabled]="itemForm.invalid || itemSubmitting()"
                  >
                    {{ itemSubmitting() ? 'Adding...' : 'Add Item' }}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    (click)="closeItemModal()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Edit Item Modal -->
      @if (editingItem()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4">Edit Item</h2>
              <p class="text-gray-600 mb-4">{{ editingItem()!.numero_parte_codigo }}</p>

              <form [formGroup]="editItemForm" (ngSubmit)="updateItem()" class="space-y-4">
                <div>
                  <label class="form-label">Quantity *</label>
                  <input
                    type="number"
                    formControlName="cantidad"
                    class="form-input"
                    min="1"
                  />
                </div>

                <div>
                  <label class="form-label">Unit Price</label>
                  <input
                    type="number"
                    formControlName="precio_unitario"
                    class="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>

                @if (itemError()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p class="text-red-800 text-sm">{{ itemError() }}</p>
                  </div>
                }

                <div class="flex gap-3 pt-4">
                  <button
                    type="submit"
                    class="btn-primary flex-1"
                    [disabled]="editItemForm.invalid || itemSubmitting()"
                  >
                    {{ itemSubmitting() ? 'Updating...' : 'Update Item' }}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    (click)="editingItem.set(null); itemError.set(null)"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Item Confirmation -->
      @if (deletingItem()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 class="text-xl font-semibold mb-2">Remove Item</h2>
            <p class="text-gray-600 mb-4">
              Are you sure you want to remove "{{ deletingItem()!.numero_parte_codigo }}" from this order?
            </p>
            <div class="flex gap-3">
              <button
                (click)="deleteItem()"
                class="btn-danger flex-1"
                [disabled]="itemSubmitting()"
              >
                {{ itemSubmitting() ? 'Removing...' : 'Remove' }}
              </button>
              <button
                (click)="deletingItem.set(null)"
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
export class PurchaseOrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrdenCompraService);
  private readonly partNumberService = inject(NumeroParteService);

  order = signal<OrdenCompraResponseDTO | null>(null);
  partNumbers = signal<NumeroParteResponseDTO[]>([]);
  loading = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);

  showAddItemModal = signal(false);
  editingItem = signal<OrdenCompraItemResponseDTO | null>(null);
  deletingItem = signal<OrdenCompraItemResponseDTO | null>(null);
  itemSubmitting = signal(false);
  itemError = signal<string | null>(null);

  orderForm: FormGroup = this.fb.group({
    observaciones: [''],
  });

  itemForm: FormGroup = this.fb.group({
    numero_parte_codigo: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
  });

  editItemForm: FormGroup = this.fb.group({
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precio_unitario: [''],
  });

  ngOnInit(): void {
    this.loadPartNumbers();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadOrder(+id);
    }
  }

  loadPartNumbers(): void {
    this.partNumberService.listar({ activos_only: true }).subscribe({
      next: (data) => this.partNumbers.set(data),
      error: (err) => console.error('Error loading part numbers:', err),
    });
  }

  loadOrder(id: number): void {
    this.loading.set(true);

    this.orderService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.orderForm.patchValue({
          observaciones: data.observaciones || '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error loading order:', err);
      },
    });
  }

  saveOrder(): void {
    this.submitting.set(true);

    const dto = {
      observaciones: this.orderForm.value.observaciones || null,
    };

    if (this.isEditMode() && this.order()) {
      this.orderService.actualizar(this.order()!.id, dto).subscribe({
        next: () => {
          this.submitting.set(false);
          // Reload order to get updated data with items
          this.loadOrder(this.order()!.id);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error updating order:', err);
        },
      });
    } else {
      this.orderService.crear(dto).subscribe({
        next: (data) => {
          this.submitting.set(false);
          this.router.navigate(['/purchase-orders', data.id, 'edit']);
        },
        error: (err) => {
          this.submitting.set(false);
          console.error('Error creating order:', err);
        },
      });
    }
  }

  closeItemModal(): void {
    this.showAddItemModal.set(false);
    this.itemForm.reset({ numero_parte_codigo: '', cantidad: 1 });
    this.itemError.set(null);
  }

  addItem(): void {
    if (this.itemForm.invalid || !this.order()) return;

    this.itemSubmitting.set(true);
    this.itemError.set(null);

    const formValue = this.itemForm.value;
    const partCode = formValue.numero_parte_codigo;
    const newQuantity = formValue.cantidad;

    // Check if item already exists in the order
    const existingItem = this.order()!.items.find(
      (item) => item.numero_parte_codigo === partCode
    );

    if (existingItem) {
      // Item exists - update with total quantity
      const totalQuantity = existingItem.cantidad + newQuantity;
      const dto = {
        cantidad: totalQuantity,
        precio_unitario: existingItem.precio_unitario?.toString(),
      };

      this.orderService.actualizarItem(this.order()!.id, existingItem.id, dto).subscribe({
        next: () => {
          this.itemSubmitting.set(false);
          this.closeItemModal();
          this.loadOrder(this.order()!.id);
        },
        error: (err) => {
          this.itemSubmitting.set(false);
          this.itemError.set(err.error?.error || err.error?.detail || 'Failed to update item.');
          console.error('Error updating item:', err);
        },
      });
    } else {
      // New item - add normally
      const dto = {
        numero_parte_codigo: partCode,
        cantidad: newQuantity,
      };

      this.orderService.agregarItem(this.order()!.id, dto).subscribe({
        next: () => {
          this.itemSubmitting.set(false);
          this.closeItemModal();
          this.loadOrder(this.order()!.id);
        },
        error: (err) => {
          this.itemSubmitting.set(false);
          this.itemError.set(err.error?.error || err.error?.detail || 'Failed to add item.');
          console.error('Error adding item:', err);
        },
      });
    }
  }

  editItem(item: OrdenCompraItemResponseDTO): void {
    this.editingItem.set(item);
    this.editItemForm.patchValue({
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
    });
  }

  updateItem(): void {
    if (this.editItemForm.invalid || !this.order() || !this.editingItem()) return;

    this.itemSubmitting.set(true);
    this.itemError.set(null);

    const formValue = this.editItemForm.value;
    const dto = {
      cantidad: formValue.cantidad,
      precio_unitario: formValue.precio_unitario ? formValue.precio_unitario.toString() : undefined,
    };

    this.orderService.actualizarItem(this.order()!.id, this.editingItem()!.id, dto).subscribe({
      next: () => {
        this.itemSubmitting.set(false);
        this.editingItem.set(null);
        this.itemError.set(null);
        this.loadOrder(this.order()!.id);
      },
      error: (err) => {
        this.itemSubmitting.set(false);
        this.itemError.set(err.error?.error || err.error?.detail || 'Failed to update item.');
        console.error('Error updating item:', err);
      },
    });
  }

  confirmDeleteItem(item: OrdenCompraItemResponseDTO): void {
    this.deletingItem.set(item);
  }

  deleteItem(): void {
    if (!this.order() || !this.deletingItem()) return;

    this.itemSubmitting.set(true);

    this.orderService.eliminarItem(this.order()!.id, this.deletingItem()!.id).subscribe({
      next: () => {
        this.itemSubmitting.set(false);
        this.deletingItem.set(null);
        this.loadOrder(this.order()!.id);
      },
      error: (err) => {
        this.itemSubmitting.set(false);
        console.error('Error deleting item:', err);
      },
    });
  }
}
