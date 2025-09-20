/**
 * Entidad ServiceType del dominio
 * Representa un tipo de servicio de mantenimiento o reparación
 */
export class ServiceType {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly estimatedDuration?: number, // en horas
    public readonly averageCost?: number,
    public readonly isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateName(name);
    this.validateDescription(description);
    this.validateCategory(category);
    this.validateEstimatedDuration(estimatedDuration);
    this.validateAverageCost(averageCost);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('El nombre del tipo de servicio debe tener al menos 2 caracteres');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length < 5) {
      throw new Error('La descripción debe tener al menos 5 caracteres');
    }
  }

  private validateCategory(category: string): void {
    const validCategories = [
      'Mantenimiento Preventivo',
      'Mantenimiento Correctivo',
      'Reparación',
      'Inspección',
      'Limpieza',
      'Otros'
    ];
    if (!validCategories.includes(category)) {
      throw new Error(`La categoría debe ser una de: ${validCategories.join(', ')}`);
    }
  }

  private validateEstimatedDuration(duration?: number): void {
    if (duration !== undefined && duration <= 0) {
      throw new Error('La duración estimada debe ser mayor a 0 horas');
    }
  }

  private validateAverageCost(cost?: number): void {
    if (cost !== undefined && cost < 0) {
      throw new Error('El costo promedio no puede ser negativo');
    }
  }

  /**
   * Obtiene el nombre formateado
   */
  getFormattedName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }

  /**
   * Obtiene el costo promedio formateado
   */
  getFormattedAverageCost(): string | null {
    if (!this.averageCost) return null;
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(this.averageCost);
  }

  /**
   * Obtiene la duración formateada
   */
  getFormattedDuration(): string | null {
    if (!this.estimatedDuration) return null;
    
    if (this.estimatedDuration < 1) {
      const minutes = Math.round(this.estimatedDuration * 60);
      return `${minutes} minutos`;
    }
    
    if (this.estimatedDuration === 1) {
      return '1 hora';
    }
    
    return `${this.estimatedDuration} horas`;
  }

  /**
   * Verifica si es un servicio de mantenimiento preventivo
   */
  isPreventiveMaintenance(): boolean {
    return this.category === 'Mantenimiento Preventivo';
  }

  /**
   * Verifica si es un servicio costoso (más de 300,000 COP)
   */
  isExpensiveService(): boolean {
    return this.averageCost ? this.averageCost > 300000 : false;
  }

  /**
   * Verifica si es un servicio de larga duración (más de 4 horas)
   */
  isLongDurationService(): boolean {
    return this.estimatedDuration ? this.estimatedDuration > 4 : false;
  }

  /**
   * Actualiza la información del tipo de servicio
   */
  update(updates: {
    name?: string;
    description?: string;
    category?: string;
    estimatedDuration?: number;
    averageCost?: number;
  }): ServiceType {
    return new ServiceType(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.category ?? this.category,
      updates.estimatedDuration ?? this.estimatedDuration,
      updates.averageCost ?? this.averageCost,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Desactiva el tipo de servicio
   */
  deactivate(): ServiceType {
    return new ServiceType(
      this.id,
      this.name,
      this.description,
      this.category,
      this.estimatedDuration,
      this.averageCost,
      false,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a un objeto plano para persistencia
   */
  toPlainObject(): {
    id: string;
    name: string;
    description: string;
    category: string;
    estimated_duration?: number;
    average_cost?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      estimated_duration: this.estimatedDuration,
      average_cost: this.averageCost,
      is_active: this.isActive,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
    };
  }

  /**
   * Crea una instancia desde un objeto plano
   */
  static fromPlainObject(data: {
    id: string;
    name: string;
    description: string;
    category: string;
    estimated_duration?: number;
    average_cost?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }): ServiceType {
    return new ServiceType(
      data.id,
      data.name,
      data.description,
      data.category,
      data.estimated_duration,
      data.average_cost,
      data.is_active,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}