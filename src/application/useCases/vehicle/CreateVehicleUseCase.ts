import { Vehicle } from '../../../domain/entities/Vehicle';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVehicleTypeRepository } from '../../../domain/repositories/IVehicleTypeRepository';

/**
 * Use Case para crear un nuevo vehículo
 */
export class CreateVehicleUseCase {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private userRepository: IUserRepository,
    private vehicleTypeRepository: IVehicleTypeRepository
  ) {}

  async execute(vehicleData: {
    userId: string;
    vehicleTypeId: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    mileage?: number;
    imageUrl?: string;
  }): Promise<Vehicle> {
    // Validar que el usuario existe
    const user = await this.userRepository.findById(vehicleData.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Validar que el tipo de vehículo existe y está activo
    const vehicleType = await this.vehicleTypeRepository.findById(vehicleData.vehicleTypeId);
    if (!vehicleType) {
      throw new Error('Tipo de vehículo no encontrado');
    }
    if (!vehicleType.isActive) {
      throw new Error('Tipo de vehículo no está activo');
    }

    // Verificar que la placa no esté en uso
    const existingVehicle = await this.vehicleRepository.findByLicensePlate(vehicleData.licensePlate);
    if (existingVehicle) {
      throw new Error('Ya existe un vehículo con esta placa');
    }

    // Crear nueva instancia de Vehicle
    const vehicle = new Vehicle(
      '', // ID será generado por la base de datos
      vehicleData.userId,
      vehicleData.vehicleTypeId,
      vehicleData.licensePlate,
      vehicleData.brand,
      vehicleData.model,
      vehicleData.year,
      vehicleData.color || '',
      true, // isActive
      new Date(),
      new Date()
    );

    // Validar la entidad
    if (!vehicle.brand || vehicle.brand.trim().length === 0) {
      throw new Error('Marca inválida');
    }

    if (!vehicle.model || vehicle.model.trim().length === 0) {
      throw new Error('Modelo inválido');
    }

    if (!vehicle.year || vehicle.year < 1886) {
      throw new Error('Año inválido');
    }

    if (!vehicle.licensePlate || vehicle.licensePlate.trim().length === 0) {
      throw new Error('Placa inválida');
    }

    if (vehicleData.mileage !== undefined && vehicleData.mileage < 0) {
      throw new Error('Kilometraje inválido');
    }

    // Guardar en el repositorio
    return await this.vehicleRepository.create(vehicle);
  }
}