import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrdenCompraListResponseDTO,
  OrdenCompraResponseDTO,
  CrearOrdenDTO,
  ActualizarOrdenDTO,
  AgregarItemDTO,
  ActualizarItemDTO,
  OrdenCompraItemResponseDTO,
  ListarOrdenesParams,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrdenCompraService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/ordenes-compra';

  // ==================== Order Operations ====================

  listar(params?: ListarOrdenesParams): Observable<OrdenCompraListResponseDTO[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.skip !== undefined) {
        httpParams = httpParams.set('skip', params.skip.toString());
      }
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.estado) {
        httpParams = httpParams.set('estado', params.estado);
      }
    }

    return this.http.get<OrdenCompraListResponseDTO[]>(`${this.baseUrl}/`, { params: httpParams });
  }

  obtenerPorId(id: number): Observable<OrdenCompraResponseDTO> {
    return this.http.get<OrdenCompraResponseDTO>(`${this.baseUrl}/${id}`);
  }

  obtenerPorNumero(numeroOrden: string): Observable<OrdenCompraResponseDTO> {
    return this.http.get<OrdenCompraResponseDTO>(`${this.baseUrl}/numero/${numeroOrden}`);
  }

  crear(dto: CrearOrdenDTO): Observable<OrdenCompraResponseDTO> {
    return this.http.post<OrdenCompraResponseDTO>(`${this.baseUrl}/`, dto);
  }

  actualizar(id: number, dto: ActualizarOrdenDTO): Observable<OrdenCompraResponseDTO> {
    return this.http.put<OrdenCompraResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ==================== State Transitions ====================

  confirmar(id: number): Observable<OrdenCompraResponseDTO> {
    return this.http.post<OrdenCompraResponseDTO>(`${this.baseUrl}/${id}/confirmar`, {});
  }

  procesar(id: number): Observable<OrdenCompraResponseDTO> {
    return this.http.post<OrdenCompraResponseDTO>(`${this.baseUrl}/${id}/procesar`, {});
  }

  entregar(id: number): Observable<OrdenCompraResponseDTO> {
    return this.http.post<OrdenCompraResponseDTO>(`${this.baseUrl}/${id}/entregar`, {});
  }

  // ==================== Item Operations ====================

  agregarItem(ordenId: number, dto: AgregarItemDTO): Observable<OrdenCompraItemResponseDTO> {
    return this.http.post<OrdenCompraItemResponseDTO>(`${this.baseUrl}/${ordenId}/items`, dto);
  }

  actualizarItem(ordenId: number, itemId: number, dto: ActualizarItemDTO): Observable<OrdenCompraItemResponseDTO> {
    return this.http.put<OrdenCompraItemResponseDTO>(`${this.baseUrl}/${ordenId}/items/${itemId}`, dto);
  }

  eliminarItem(ordenId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ordenId}/items/${itemId}`);
  }
}
