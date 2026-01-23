/**
 * DTO for assigning inventory to a location
 */
export interface AsignarInventarioDTO {
  numero_parte_id: number;
  ubicacion_id: number;
  cantidad: number;
}

/**
 * DTO for updating inventory quantity
 */
export interface ActualizarInventarioDTO {
  cantidad: number;
}

/**
 * Response DTO for inventory at a location
 */
export interface InventarioUbicacionResponseDTO {
  id: number;
  numero_parte_id: number;
  ubicacion_id: number;
  cantidad: number;
  created_at: string;
  updated_at: string;
  numero_parte_codigo?: string;
  numero_parte_descripcion?: string;
  ubicacion_codigo?: string;
}

/**
 * DTO for a product in a location
 */
export interface ProductoEnUbicacionDTO {
  inventario_id: number;
  numero_parte_id: number;
  numero_parte_codigo: string;
  numero_parte_descripcion: string;
  cantidad: number;
}

/**
 * DTO for a location with its inventory
 */
export interface UbicacionConInventarioDTO {
  ubicacion_id: number;
  ubicacion_codigo: string;
  capacidad: number;
  ocupacion_actual: number;
  disponible: number;
  productos: ProductoEnUbicacionDTO[];
}

/**
 * DTO for a location where a product is stored
 */
export interface UbicacionDelProductoDTO {
  inventario_id: number;
  ubicacion_id: number;
  ubicacion_codigo: string;
  cedis_nombre?: string;
  cantidad: number;
  fecha_ingreso: string;
}
