import { Service } from '../entities/Service';

/**
 * Interfaz del repositorio de servicios
 * Define los contratos para el acceso a datos de servicios
 */
export interface IServiceRepository {
  /**
   * Obtiene un servicio por su ID
   */
  findById(id: string): Promise<Service | null>;

  /**
   * Obtiene todos los servicios de un vehículo
   */
  findByVehicleId(vehicleId: string): Promise<Service[]>;

  /**
   * Obtiene servicios por tipo
   */
  findByServiceTypeId(serviceTypeId: string): Promise<Service[]>;

  /**
   * Obtiene servicios por proveedor
   */
  findByProviderId(providerId: string): Promise<Service[]>;

  /**
   * Crea un nuevo servicio
   */
  create(service: Service): Promise<Service>;

  /**
   * Actualiza un servicio existente
   */
  update(id: string, service: Partial<Service>): Promise<Service>;

  /**
   * Elimina un servicio
   */
  delete(id: string): Promise<void>;

  /**
   * Obtiene servicios completados de un vehículo
   */
  findCompletedByVehicleId(vehicleId: string): Promise<Service[]>;

  /**
   * Obtiene servicios pendientes de un vehículo
   */
  findPendingByVehicleId(vehicleId: string): Promise<Service[]>;

  /**
   * Obtiene servicios por rango de fechas
   */
  findByDateRange(startDate: Date, endDate: Date, vehicleId?: string): Promise<Service[]>;

  /**
   * Obtiene servicios por rango de costos
   */
  findByCostRange(minCost: number, maxCost: number, vehicleId?: string): Promise<Service[]>;

  /**
   * Obtiene los servicios más recientes de un vehículo
   */
  findRecentByVehicleId(vehicleId: string, limit?: number): Promise<Service[]>;

  /**
   * Obtiene el historial completo de servicios de un usuario
   */
  findByUserId(userId: string): Promise<Service[]>;

  /**
   * Calcula el costo total de servicios de un vehículo
   */
  getTotalCostByVehicleId(vehicleId: string): Promise<number>;

  /**
   * Obtiene estadísticas de servicios por vehículo
   */
  getServiceStatsByVehicleId(vehicleId: string): Promise<{
    totalServices: number;
    totalCost: number;
    averageCost: number;
    lastServiceDate?: Date;
  }>;

  /**
   * Marca un servicio como completado
   */
  markAsCompleted(id: string): Promise<Service>;

  /**
   * Busca servicios por descripción
   */
  searchByDescription(description: string, vehicleId?: string): Promise<Service[]>;
}