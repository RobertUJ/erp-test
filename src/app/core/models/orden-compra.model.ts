// Purchase Order States
export type EstadoOrden = 'BORRADOR' | 'CONFIRMADA' | 'EN_PROCESO' | 'ENTREGADA';

// Order Item Response DTO
export interface OrdenCompraItemResponseDTO {
  id: number;
  numero_parte_id: number;
  numero_parte_codigo: string;
  numero_parte_descripcion: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

// Order List Response DTO (without items)
export interface OrdenCompraListResponseDTO {
  id: number;
  numero_orden: string;
  estado: EstadoOrden;
  total: string;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_confirmacion: string | null;
  fecha_entrega: string | null;
}

// Order Response DTO (with items)
export interface OrdenCompraResponseDTO extends OrdenCompraListResponseDTO {
  items: OrdenCompraItemResponseDTO[];
}

// Create Order DTO
export interface CrearOrdenDTO {
  observaciones?: string | null;
}

// Update Order DTO
export interface ActualizarOrdenDTO {
  observaciones?: string | null;
}

// Add Item to Order DTO
export interface AgregarItemDTO {
  numero_parte_codigo: string;
  cantidad: number;
}

// Update Item DTO
export interface ActualizarItemDTO {
  cantidad?: number;
  precio_unitario?: string;
}

// List Orders Params
export interface ListarOrdenesParams {
  skip?: number;
  limit?: number;
  estado?: EstadoOrden;
}
