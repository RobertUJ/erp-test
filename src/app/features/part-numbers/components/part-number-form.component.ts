import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumeroParteService } from '../../../core/services';
import { UnidadMedida, NumeroParteResponseDTO } from '../../../core/models';

/**
 * Component for creating or editing a part number
 */
@Component({
  selector: 'app-part-number-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/part-numbers" class="text-gray-600 hover:text-gray-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode() ? 'Edit Part Number' : 'Create Part Number' }}</h1>
          <p class="text-gray-600">{{ isEditMode() ? 'Modify part number details' : 'Add a new part number to the system' }}</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading">
          <div class="loading__spinner"></div>
        </div>
      }

      @if (!loading()) {

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Code -->
        <div>
          <label class="form-label" for="codigo">Code *</label>
          <input
            type="text"
            id="codigo"
            formControlName="codigo"
            class="form-input"
            placeholder="e.g., PART-001"
          />
          @if (form.get('codigo')?.invalid && form.get('codigo')?.touched) {
            <p class="text-red-500 text-sm mt-1">Code is required (max 50 characters)</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="form-label" for="descripcion">Description *</label>
          <textarea
            id="descripcion"
            formControlName="descripcion"
            class="form-input"
            rows="3"
            placeholder="Enter part description..."
          ></textarea>
          @if (form.get('descripcion')?.invalid && form.get('descripcion')?.touched) {
            <p class="text-red-500 text-sm mt-1">Description is required (max 255 characters)</p>
          }
        </div>

        <!-- Price and Unit -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label" for="precio">Price</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="precio"
                formControlName="precio"
                class="form-input pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label class="form-label" for="unidad_medida">Unit of Measure</label>
            <select id="unidad_medida" formControlName="unidad_medida" class="form-input">
              @for (unit of units; track unit) {
                <option [value]="unit">{{ getUnitLabel(unit) }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Error Message -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800">{{ error() }}</p>
          </div>
        }

        <!-- Success Message -->
        @if (success()) {
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800">{{ isEditMode() ? 'Part number updated successfully!' : 'Part number created successfully!' }}</p>
          </div>
        }

        <!-- Actions -->
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            class="btn-primary flex-1"
            [disabled]="form.invalid || submitting()"
          >
            @if (submitting()) {
              <span class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditMode() ? 'Updating...' : 'Creating...' }}
              </span>
            } @else {
              {{ isEditMode() ? 'Update Part Number' : 'Create Part Number' }}
            }
          </button>
          <a routerLink="/part-numbers" class="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
      }
    </div>
  `,
})
export class PartNumberFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly partNumberService = inject(NumeroParteService);

  units: UnidadMedida[] = ['PZA', 'KG', 'LT', 'MT', 'CJA'];

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    precio: ['0.00'],
    unidad_medida: ['PZA'],
  });

  isEditMode = signal(false);
  partNumber = signal<NumeroParteResponseDTO | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadPartNumber(+id);
    }
  }

  loadPartNumber(id: number): void {
    this.loading.set(true);
    this.partNumberService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.partNumber.set(data);
        this.form.patchValue({
          codigo: data.codigo,
          descripcion: data.descripcion,
          precio: data.precio,
          unidad_medida: data.unidad_medida,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to load part number.');
        console.error('Error loading part number:', err);
      },
    });
  }

  getUnitLabel(unit: UnidadMedida): string {
    const labels: Record<UnidadMedida, string> = {
      PZA: 'Piece (PZA)',
      KG: 'Kilogram (KG)',
      LT: 'Liter (LT)',
      MT: 'Meter (MT)',
      CJA: 'Box (CJA)',
    };
    return labels[unit];
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const formValue = this.form.value;
    const dto = {
      codigo: formValue.codigo,
      descripcion: formValue.descripcion,
      precio: formValue.precio?.toString() || '0.00',
      unidad_medida: formValue.unidad_medida,
    };

    if (this.isEditMode() && this.partNumber()) {
      this.partNumberService.actualizar(this.partNumber()!.id, dto).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.success.set(true);
          setTimeout(() => {
            this.router.navigate(['/part-numbers', result.id]);
          }, 1500);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.error || err.error?.detail || 'Failed to update part number. Please try again.');
          console.error('Error updating part number:', err);
        },
      });
    } else {
      this.partNumberService.crear(dto).subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.success.set(true);
          setTimeout(() => {
            this.router.navigate(['/part-numbers', result.id]);
          }, 1500);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.error || err.error?.detail || 'Failed to create part number. Please try again.');
          console.error('Error creating part number:', err);
        },
      });
    }
  }
}
