/**
 * Entidad User del dominio
 * Representa un usuario en el sistema con sus propiedades esenciales
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly phone?: string,
    public readonly address?: string,
    public readonly city?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateEmail(email);
    this.validateFullName(fullName);
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
  }

  private validateFullName(fullName: string): void {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('El nombre completo debe tener al menos 2 caracteres');
    }
  }

  /**
   * Obtiene el primer nombre del usuario
   */
  getFirstName(): string {
    return this.fullName.split(' ')[0];
  }

  isValid(): boolean {
    try {
      this.validateEmail(this.email);
      this.validateFullName(this.fullName);
      return true;
    } catch (error) {
      return false;
    }
  } 

  /**
   * Verifica si el usuario tiene información de contacto completa
   */
  hasCompleteContactInfo(): boolean {
    return !!(this.phone && this.address && this.city);
  }

  /**
   * Crea una nueva instancia con información actualizada
   */
  updateProfile(updates: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
  }): User {
    return new User(
      this.id,
      this.email,
      updates.fullName ?? this.fullName,
      updates.phone ?? this.phone,
      updates.address ?? this.address,
      updates.city ?? this.city,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a un objeto plano para persistencia
   */
  toPlainObject(): {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    address?: string;
    city?: string;
    created_at?: string;
    updated_at?: string;
  } {
    return {
      id: this.id,
      email: this.email,
      full_name: this.fullName,
      phone: this.phone,
      address: this.address,
      city: this.city,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
    };
  }

  /**
   * Crea una instancia desde un objeto plano
   */
  static fromPlainObject(data: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    address?: string;
    city?: string;
    created_at?: string;
    updated_at?: string;
  }): User {
    return new User(
      data.id,
      data.email,
      data.full_name,
      data.phone,
      data.address,
      data.city,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}