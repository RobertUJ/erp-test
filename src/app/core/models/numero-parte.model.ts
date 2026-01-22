/**
 * Unit of measurement enum
 */
export type UnidadMedida = 'PZA' | 'KG' | 'LT' | 'MT' | 'CJA';

/**
 * DTO for creating a new part number
 */
export interface CrearNumeroParteDTO {
  codigo: string;
  descripcion: string;
  precio?: string;
  unidad_medida?: UnidadMedida;
}

/**
 * DTO for updating a part number
 */
export interface ActualizarNumeroParteDTO {
  descripcion?: string;
  precio?: string;
  unidad_medida?: UnidadMedida;
  activo?: boolean;
}

/**
 * Response DTO for part number
 */
export interface NumeroParteResponseDTO {
  id: number;
  codigo: string;
  descripcion: string;
  stock: number;
  precio: string;
  unidad_medida: UnidadMedida;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Query params for listing part numbers
 */
export interface ListarNumerosParteParams {
  skip?: number;
  limit?: number;
  activos_only?: boolean;
  q?: string;
}
