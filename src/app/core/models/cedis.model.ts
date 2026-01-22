/**
 * DTO for creating a new CEDIS (Distribution Center)
 */
export interface CreateCedisDTO {
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

/**
 * DTO for updating a CEDIS
 */
export interface ActualizarCedisDTO {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

/**
 * Response DTO for location within a CEDIS
 */
export interface UbicacionesResponseDTO {
  id: number;
  codigo: string;
  descripcion: string;
  rack: string;
  nivel: string;
  contenedor: string;
  capacidad: number;
}

/**
 * Response DTO for CEDIS with its locations
 */
export interface CedisUbicacionResponseDTO {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  email: string | null;
  ubicaciones: UbicacionesResponseDTO[];
}

/**
 * DTO for adding a location to a CEDIS
 */
export interface AgregarUbicacionDTO {
  codigo: string;
  descripcion: string;
  rack: string;
  nivel: string;
  contenedor: string;
  capacidad: number;
}

/**
 * DTO for updating a location
 */
export interface ActualizarUbicacionDTO {
  descripcion?: string;
  rack?: string;
  nivel?: string;
  contenedor?: string;
  capacidad?: number;
}
