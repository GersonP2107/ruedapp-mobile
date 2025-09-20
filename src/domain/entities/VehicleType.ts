/**
 * Entidad VehicleType del dominio
 * Representa un tipo de vehículo en el sistema
 */
export class VehicleType {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateName(name);
    this.validateDescription(description);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('El nombre del tipo de vehículo debe tener al menos 2 caracteres');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length < 5) {
      throw new Error('La descripción debe tener al menos 5 caracteres');
    }
  }

  /**
   * Obtiene el nombre formateado (primera letra en mayúscula)
   */
  getFormattedName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }

  /**
   * Verifica si es un tipo de vehículo comercial
   */
  isCommercialVehicle(): boolean {
    const commercialTypes = ['camión', 'bus', 'taxi', 'uber', 'van comercial'];
    return commercialTypes.some(type => 
      this.name.toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Actualiza la información del tipo de vehículo
   */
  update(updates: {
    name?: string;
    description?: string;
  }): VehicleType {
    return new VehicleType(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Desactiva el tipo de vehículo
   */
  deactivate(): VehicleType {
    return new VehicleType(
      this.id,
      this.name,
      this.description,
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
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
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
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }): VehicleType {
    return new VehicleType(
      data.id,
      data.name,
      data.description,
      data.is_active,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}