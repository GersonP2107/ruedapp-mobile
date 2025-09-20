/**
 * Entidad Vehicle del dominio
 * Representa un vehículo en el sistema con sus propiedades y validaciones
 */
export class Vehicle {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly vehicleTypeId: string,
    public readonly licensePlate: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly year: number,
    public readonly color: string,
    public readonly isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateLicensePlate(licensePlate);
    this.validateBrand(brand);
    this.validateModel(model);
    this.validateYear(year);
    this.validateColor(color);
  }

  private validateLicensePlate(licensePlate: string): void {
    if (!licensePlate || licensePlate.trim().length < 3) {
      throw new Error('La placa debe tener al menos 3 caracteres');
    }
    // Validación básica para placas colombianas (ABC123 o ABC12D)
    const plateRegex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]?$/;
    if (!plateRegex.test(licensePlate.toUpperCase().replace(/\s/g, ''))) {
      throw new Error('Formato de placa inválido');
    }
  }

  private validateBrand(brand: string): void {
    if (!brand || brand.trim().length < 2) {
      throw new Error('La marca debe tener al menos 2 caracteres');
    }
  }

  private validateModel(model: string): void {
    if (!model || model.trim().length < 1) {
      throw new Error('El modelo es requerido');
    }
  }

  private validateYear(year: number): void {
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      throw new Error(`El año debe estar entre 1900 y ${currentYear + 1}`);
    }
  }

  private validateColor(color: string): void {
    if (!color || color.trim().length < 2) {
      throw new Error('El color debe tener al menos 2 caracteres');
    }
  }

  /**
   * Obtiene el nombre completo del vehículo
   */
  getFullName(): string {
    return `${this.brand} ${this.model} ${this.year}`;
  }

  /**
   * Obtiene la placa formateada
   */
  getFormattedPlate(): string {
    const plate = this.licensePlate.toUpperCase().replace(/\s/g, '');
    if (plate.length === 6) {
      return `${plate.substring(0, 3)} ${plate.substring(3)}`;
    }
    return plate;
  }

  /**
   * Verifica si el vehículo es relativamente nuevo (menos de 5 años)
   */
  isNewVehicle(): boolean {
    const currentYear = new Date().getFullYear();
    return (currentYear - this.year) < 5;
  }

  /**
   * Calcula la antigüedad del vehículo en años
   */
  getAge(): number {
    const currentYear = new Date().getFullYear();
    return currentYear - this.year;
  }

  /**
   * Desactiva el vehículo
   */
  deactivate(): Vehicle {
    return new Vehicle(
      this.id,
      this.userId,
      this.vehicleTypeId,
      this.licensePlate,
      this.brand,
      this.model,
      this.year,
      this.color,
      false,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Actualiza la información del vehículo
   */
  update(updates: {
    vehicleTypeId?: string;
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
  }): Vehicle {
    return new Vehicle(
      this.id,
      this.userId,
      updates.vehicleTypeId ?? this.vehicleTypeId,
      updates.licensePlate ?? this.licensePlate,
      updates.brand ?? this.brand,
      updates.model ?? this.model,
      updates.year ?? this.year,
      updates.color ?? this.color,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a un objeto plano para persistencia
   */
  toPlainObject(): {
    id: string;
    user_id: string;
    vehicle_type_id: string;
    license_plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  } {
    return {
      id: this.id,
      user_id: this.userId,
      vehicle_type_id: this.vehicleTypeId,
      license_plate: this.licensePlate,
      brand: this.brand,
      model: this.model,
      year: this.year,
      color: this.color,
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
    user_id: string;
    vehicle_type_id: string;
    license_plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }): Vehicle {
    return new Vehicle(
      data.id,
      data.user_id,
      data.vehicle_type_id,
      data.license_plate,
      data.brand,
      data.model,
      data.year,
      data.color,
      data.is_active,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}