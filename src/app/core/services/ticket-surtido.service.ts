import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TicketSurtidoResponseDTO,
  ActualizarEstadoTicketDTO,
  ListarTicketsParams,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TicketSurtidoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets-surtido`;

  /**
   * List all tickets with optional filters
   */
  listar(params?: ListarTicketsParams): Observable<TicketSurtidoResponseDTO[]> {
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

    return this.http.get<TicketSurtidoResponseDTO[]>(`${this.baseUrl}/`, { params: httpParams });
  }

  /**
   * List pending tickets for warehouse
   */
  listarPendientes(skip = 0, limit = 100): Observable<TicketSurtidoResponseDTO[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<TicketSurtidoResponseDTO[]>(`${this.baseUrl}/pendientes`, { params });
  }

  /**
   * Get ticket by ID
   */
  obtenerPorId(id: number): Observable<TicketSurtidoResponseDTO> {
    return this.http.get<TicketSurtidoResponseDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get tickets by order ID
   */
  obtenerPorOrdenId(ordenId: number): Observable<TicketSurtidoResponseDTO[]> {
    return this.http.get<TicketSurtidoResponseDTO[]>(`${this.baseUrl}/orden/${ordenId}`);
  }

  /**
   * Generate ticket for an order
   */
  generarTicket(ordenId: number): Observable<TicketSurtidoResponseDTO> {
    return this.http.post<TicketSurtidoResponseDTO>(`${this.baseUrl}/generar/${ordenId}`, {});
  }

  /**
   * Update ticket state
   */
  actualizarEstado(id: number, dto: ActualizarEstadoTicketDTO): Observable<TicketSurtidoResponseDTO> {
    return this.http.patch<TicketSurtidoResponseDTO>(`${this.baseUrl}/${id}/estado`, dto);
  }

  /**
   * Complete ticket (deducts stock)
   */
  completarTicket(id: number): Observable<TicketSurtidoResponseDTO> {
    return this.http.post<TicketSurtidoResponseDTO>(`${this.baseUrl}/${id}/completar`, {});
  }
}
