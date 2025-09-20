/**
 * Entidad Service del dominio
 * Representa un servicio de mantenimiento o reparación en el sistema
 */
export class Service {
  constructor(
    public readonly id: string,
    public readonly vehicleId: string,
    public readonly serviceTypeId: string,
    public readonly description: string,
    public readonly cost: number,
    public readonly serviceDate: Date,
    public readonly mileage?: number,
    public readonly notes?: string,
    public readonly providerId?: string,
    public readonly isCompleted: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateDescription(description);
    this.validateCost(cost);
    this.validateServiceDate(serviceDate);
    this.validateMileage(mileage);
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length < 5) {
      throw new Error('La descripción del servicio debe tener al menos 5 caracteres');
    }
  }

  private validateCost(cost: number): void {
    if (cost < 0) {
      throw new Error('El costo del servicio no puede ser negativo');
    }
  }

  private validateServiceDate(serviceDate: Date): void {
    if (serviceDate > new Date()) {
      throw new Error('La fecha del servicio no puede ser futura');
    }
  }

  private validateMileage(mileage?: number): void {
    if (mileage !== undefined && mileage < 0) {
      throw new Error('El kilometraje no puede ser negativo');
    }
  }

  /**
   * Obtiene el costo formateado como moneda
   */
  getFormattedCost(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(this.cost);
  }

  /**
   * Obtiene la fecha formateada
   */
  getFormattedDate(): string {
    return this.serviceDate.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calcula los días transcurridos desde el servicio
   */
  getDaysSinceService(): number {
    const today = new Date();
    const diffTime = today.getTime() - this.serviceDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si es un servicio costoso (más de 500,000 COP)
   */
  isExpensiveService(): boolean {
    return this.cost > 500000;
  }

  /**
   * Verifica si es un servicio reciente (menos de 30 días)
   */
  isRecentService(): boolean {
    return this.getDaysSinceService() <= 30;
  }

  /**
   * Marca el servicio como completado
   */
  markAsCompleted(): Service {
    return new Service(
      this.id,
      this.vehicleId,
      this.serviceTypeId,
      this.description,
      this.cost,
      this.serviceDate,
      this.mileage,
      this.notes,
      this.providerId,
      true,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Actualiza la información del servicio
   */
  update(updates: {
    description?: string;
    cost?: number;
    serviceDate?: Date;
    mileage?: number;
    notes?: string;
    providerId?: string;
  }): Service {
    return new Service(
      this.id,
      this.vehicleId,
      this.serviceTypeId,
      updates.description ?? this.description,
      updates.cost ?? this.cost,
      updates.serviceDate ?? this.serviceDate,
      updates.mileage ?? this.mileage,
      updates.notes ?? this.notes,
      updates.providerId ?? this.providerId,
      this.isCompleted,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a un objeto plano para persistencia
   */
  toPlainObject(): {
    id: string;
    vehicle_id: string;
    service_type_id: string;
    description: string;
    cost: number;
    service_date: string;
    mileage?: number;
    notes?: string;
    provider_id?: string;
    is_completed: boolean;
    created_at?: string;
    updated_at?: string;
  } {
    return {
      id: this.id,
      vehicle_id: this.vehicleId,
      service_type_id: this.serviceTypeId,
      description: this.description,
      cost: this.cost,
      service_date: this.serviceDate.toISOString(),
      mileage: this.mileage,
      notes: this.notes,
      provider_id: this.providerId,
      is_completed: this.isCompleted,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
    };
  }

  /**
   * Crea una instancia desde un objeto plano
   */
  static fromPlainObject(data: {
    id: string;
    vehicle_id: string;
    service_type_id: string;
    description: string;
    cost: number;
    service_date: string;
    mileage?: number;
    notes?: string;
    provider_id?: string;
    is_completed: boolean;
    created_at?: string;
    updated_at?: string;
  }): Service {
    return new Service(
      data.id,
      data.vehicle_id,
      data.service_type_id,
      data.description,
      data.cost,
      new Date(data.service_date),
      data.mileage,
      data.notes,
      data.provider_id,
      data.is_completed,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}