import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CedisUbicacionResponseDTO,
  CreateCedisDTO,
  ActualizarCedisDTO,
  UbicacionesResponseDTO,
  AgregarUbicacionDTO,
  ActualizarUbicacionDTO,
} from '../models';

/**
 * Service for managing CEDIS (Distribution Centers) and their locations
 */
@Injectable({
  providedIn: 'root',
})
export class CedisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/cedis';

  // ==================== CEDIS Operations ====================

  /**
   * List all CEDIS with their locations
   */
  listarCedis(skip = 0, limit = 10): Observable<CedisUbicacionResponseDTO[]> {
    const params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
    return this.http.get<CedisUbicacionResponseDTO[]>(`${this.baseUrl}/`, { params });
  }

  /**
   * Get a CEDIS by ID with all its locations
   */
  obtenerCedis(cedisId: number): Observable<CedisUbicacionResponseDTO> {
    return this.http.get<CedisUbicacionResponseDTO>(`${this.baseUrl}/${cedisId}`);
  }

  /**
   * Create a new CEDIS
   */
  crearCedis(dto: CreateCedisDTO): Observable<CedisUbicacionResponseDTO> {
    return this.http.post<CedisUbicacionResponseDTO>(`${this.baseUrl}/`, dto);
  }

  /**
   * Update an existing CEDIS
   */
  actualizarCedis(cedisId: number, dto: ActualizarCedisDTO): Observable<CedisUbicacionResponseDTO> {
    return this.http.put<CedisUbicacionResponseDTO>(`${this.baseUrl}/${cedisId}`, dto);
  }

  /**
   * Delete a CEDIS and all its locations
   */
  eliminarCedis(cedisId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cedisId}`);
  }

  // ==================== Location Operations ====================

  /**
   * List all locations for a CEDIS
   */
  listarUbicaciones(cedisId: number): Observable<UbicacionesResponseDTO[]> {
    return this.http.get<UbicacionesResponseDTO[]>(`${this.baseUrl}/${cedisId}/ubicaciones`);
  }

  /**
   * Get a specific location from a CEDIS
   */
  obtenerUbicacion(cedisId: number, ubicacionId: number): Observable<UbicacionesResponseDTO> {
    return this.http.get<UbicacionesResponseDTO>(
      `${this.baseUrl}/${cedisId}/ubicaciones/${ubicacionId}`
    );
  }

  /**
   * Create a new location in a CEDIS
   */
  crearUbicacion(cedisId: number, dto: AgregarUbicacionDTO): Observable<UbicacionesResponseDTO> {
    return this.http.post<UbicacionesResponseDTO>(`${this.baseUrl}/${cedisId}/ubicaciones`, dto);
  }

  /**
   * Update an existing location
   */
  actualizarUbicacion(
    cedisId: number,
    ubicacionId: number,
    dto: ActualizarUbicacionDTO
  ): Observable<UbicacionesResponseDTO> {
    return this.http.put<UbicacionesResponseDTO>(
      `${this.baseUrl}/${cedisId}/ubicaciones/${ubicacionId}`,
      dto
    );
  }

  /**
   * Delete a location from a CEDIS
   */
  eliminarUbicacion(cedisId: number, ubicacionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cedisId}/ubicaciones/${ubicacionId}`);
  }
}
