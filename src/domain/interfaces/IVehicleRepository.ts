import { Vehicle } from '../entities/Vehicle';

/**
 * Interfaz del repositorio de vehículos
 * Define los contratos para el acceso a datos de vehículos
 */
export interface IVehicleRepository {
  /**
   * Obtiene un vehículo por su ID
   */
  findById(id: string): Promise<Vehicle | null>;

  /**
   * Obtiene todos los vehículos de un usuario
   */
  findByUserId(userId: string): Promise<Vehicle[]>;

  /**
   * Obtiene vehículos por tipo
   */
  findByVehicleTypeId(vehicleTypeId: string): Promise<Vehicle[]>;

  /**
   * Busca un vehículo por placa
   */
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;

  /**
   * Crea un nuevo vehículo
   */
  create(vehicle: Vehicle): Promise<Vehicle>;

  /**
   * Actualiza un vehículo existente
   */
  update(vehicle: Vehicle): Promise<Vehicle>;

  /**
   * Elimina un vehículo
   */
  delete(id: string): Promise<void>;

  /**
   * Obtiene todos los vehículos activos de un usuario
   */
  findActiveByUserId(userId: string): Promise<Vehicle[]>;

  /**
   * Desactiva un vehículo
   */
  deactivate(id: string): Promise<Vehicle>;

  /**
   * Busca vehículos por marca y modelo
   */
  searchByBrandAndModel(brand: string, model: string): Promise<Vehicle[]>;

  /**
   * Obtiene vehículos por rango de años
   */
  findByYearRange(startYear: number, endYear: number): Promise<Vehicle[]>;

  /**
   * Verifica si existe un vehículo con la placa dada
   */
  existsByLicensePlate(licensePlate: string): Promise<boolean>;

  /**
   * Cuenta el número de vehículos de un usuario
   */
  countByUserId(userId: string): Promise<number>;
}