import { ServiceType } from '../entities/ServiceType';

/**
 * Interfaz del repositorio de tipos de servicio
 * Define los contratos para el acceso a datos de tipos de servicio
 */
export interface IServiceTypeRepository {
  /**
   * Obtiene un tipo de servicio por su ID
   */
  findById(id: string): Promise<ServiceType | null>;

  /**
   * Obtiene todos los tipos de servicio
   */
  findAll(): Promise<ServiceType[]>;

  /**
   * Obtiene todos los tipos de servicio activos
   */
  findActive(): Promise<ServiceType[]>;

  /**
   * Obtiene tipos de servicio por categoría
   */
  findByCategory(category: string): Promise<ServiceType[]>;

  /**
   * Busca tipos de servicio por nombre
   */
  findByName(name: string): Promise<ServiceType | null>;

  /**
   * Crea un nuevo tipo de servicio
   */
  create(serviceType: ServiceType): Promise<ServiceType>;

  /**
   * Actualiza un tipo de servicio existente
   */
  update(id: string, serviceType: Partial<ServiceType>): Promise<ServiceType>;

  /**
   * Elimina un tipo de servicio
   */
  delete(id: string): Promise<void>;

  /**
   * Desactiva un tipo de servicio
   */
  deactivate(id: string): Promise<ServiceType>;

  /**
   * Busca tipos de servicio por descripción
   */
  searchByDescription(description: string): Promise<ServiceType[]>;

  /**
   * Obtiene tipos de servicio por rango de costo promedio
   */
  findByCostRange(minCost: number, maxCost: number): Promise<ServiceType[]>;

  /**
   * Obtiene tipos de servicio por duración estimada
   */
  findByDurationRange(minHours: number, maxHours: number): Promise<ServiceType[]>;

  /**
   * Obtiene tipos de servicio de mantenimiento preventivo
   */
  findPreventiveMaintenance(): Promise<ServiceType[]>;

  /**
   * Verifica si existe un tipo de servicio con el nombre dado
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Obtiene las categorías disponibles
   */
  getAvailableCategories(): Promise<string[]>;
}