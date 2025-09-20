import { VehicleType } from '../entities/VehicleType';

/**
 * Interfaz del repositorio de tipos de vehículo
 * Define los contratos para el acceso a datos de tipos de vehículo
 */
export interface IVehicleTypeRepository {
  /**
   * Obtiene un tipo de vehículo por su ID
   */
  findById(id: string): Promise<VehicleType | null>;

  /**
   * Obtiene todos los tipos de vehículo
   */
  findAll(): Promise<VehicleType[]>;

  /**
   * Obtiene todos los tipos de vehículo activos
   */
  findActive(): Promise<VehicleType[]>;

  /**
   * Busca tipos de vehículo por nombre
   */
  findByName(name: string): Promise<VehicleType | null>;

  /**
   * Crea un nuevo tipo de vehículo
   */
  create(vehicleType: VehicleType): Promise<VehicleType>;

  /**
   * Actualiza un tipo de vehículo existente
   */
  update(vehicleType: VehicleType): Promise<VehicleType>;

  /**
   * Elimina un tipo de vehículo
   */
  delete(id: string): Promise<void>;

  /**
   * Desactiva un tipo de vehículo
   */
  deactivate(id: string): Promise<VehicleType>;

  /**
   * Busca tipos de vehículo por descripción
   */
  searchByDescription(description: string): Promise<VehicleType[]>;

  /**
   * Verifica si existe un tipo de vehículo con el nombre dado
   */
  existsByName(name: string): Promise<boolean>;
}