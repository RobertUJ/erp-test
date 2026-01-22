import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NumeroParteResponseDTO,
  CrearNumeroParteDTO,
  ActualizarNumeroParteDTO,
  ListarNumerosParteParams,
} from '../models';

/**
 * Service for managing part numbers
 */
@Injectable({
  providedIn: 'root',
})
export class NumeroParteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/numeros-parte';

  /**
   * Get all part numbers with optional filters
   */
  listar(params?: ListarNumerosParteParams): Observable<NumeroParteResponseDTO[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.skip !== undefined) {
        httpParams = httpParams.set('skip', params.skip.toString());
      }
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.activos_only !== undefined) {
        httpParams = httpParams.set('activos_only', params.activos_only.toString());
      }
      if (params.q) {
        httpParams = httpParams.set('q', params.q);
      }
    }

    return this.http.get<NumeroParteResponseDTO[]>(`${this.baseUrl}/`, { params: httpParams });
  }

  /**
   * Get a part number by ID
   */
  obtenerPorId(id: number): Observable<NumeroParteResponseDTO> {
    return this.http.get<NumeroParteResponseDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get a part number by code
   */
  obtenerPorCodigo(codigo: string): Observable<NumeroParteResponseDTO> {
    return this.http.get<NumeroParteResponseDTO>(`${this.baseUrl}/codigo/${codigo}`);
  }

  /**
   * Create a new part number
   */
  crear(dto: CrearNumeroParteDTO): Observable<NumeroParteResponseDTO> {
    return this.http.post<NumeroParteResponseDTO>(`${this.baseUrl}/`, dto);
  }

  /**
   * Update an existing part number
   */
  actualizar(id: number, dto: ActualizarNumeroParteDTO): Observable<NumeroParteResponseDTO> {
    return this.http.put<NumeroParteResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Deactivate a part number (soft delete)
   */
  desactivar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
