import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AsignarInventarioDTO,
  ActualizarInventarioDTO,
  InventarioUbicacionResponseDTO,
  UbicacionConInventarioDTO,
  UbicacionDelProductoDTO,
} from '../models';
import { environment } from '../../../environments/environment';

/**
 * Service for managing inventory by location
 */
@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/inventario`;

  /**
   * Assign inventory to a location with capacity validation
   */
  asignarInventario(dto: AsignarInventarioDTO): Observable<InventarioUbicacionResponseDTO> {
    return this.http.post<InventarioUbicacionResponseDTO>(`${this.baseUrl}/`, dto);
  }

  /**
   * Get all products in a location
   */
  obtenerInventarioEnUbicacion(ubicacionId: number): Observable<UbicacionConInventarioDTO> {
    return this.http.get<UbicacionConInventarioDTO>(`${this.baseUrl}/ubicacion/${ubicacionId}`);
  }

  /**
   * Get all locations where a product is stored
   */
  obtenerUbicacionesDeProducto(numeroParteId: number): Observable<UbicacionDelProductoDTO[]> {
    return this.http.get<UbicacionDelProductoDTO[]>(
      `${this.baseUrl}/numero-parte/${numeroParteId}`
    );
  }

  /**
   * Update the quantity of a product in a location
   */
  actualizarCantidad(
    inventarioId: number,
    dto: ActualizarInventarioDTO
  ): Observable<InventarioUbicacionResponseDTO> {
    return this.http.put<InventarioUbicacionResponseDTO>(`${this.baseUrl}/${inventarioId}`, dto);
  }

  /**
   * Remove a product from a location
   */
  removerDeUbicacion(inventarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${inventarioId}`);
  }
}
