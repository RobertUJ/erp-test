// Ticket States
export type EstadoTicket = 'PENDIENTE' | 'EN_SURTIDO' | 'COMPLETADO';

// FIFO Location DTO
export interface UbicacionFIFODTO {
  ubicacion_id: number;
  cantidad: number;
  fecha_ingreso: string;
}

// Ticket Item DTO
export interface TicketItemDTO {
  numero_parte_id: number | null;
  numero_parte_codigo: string;
  numero_parte_descripcion: string;
  cantidad: number;
  ubicaciones_fifo: UbicacionFIFODTO[];
}

// Ticket Response DTO
export interface TicketSurtidoResponseDTO {
  id: number;
  numero_ticket: string;
  orden_compra_id: number;
  numero_orden: string | null;
  estado: EstadoTicket;
  items: TicketItemDTO[];
  fecha_generacion: string;
  fecha_completado: string | null;
}

// Update Ticket State DTO
export interface ActualizarEstadoTicketDTO {
  estado: EstadoTicket;
}

// List Tickets Params
export interface ListarTicketsParams {
  skip?: number;
  limit?: number;
  estado?: EstadoTicket;
}
