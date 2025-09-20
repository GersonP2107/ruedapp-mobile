import { Vehicle } from '../../../domain/entities/Vehicle';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { IVehicleTypeRepository } from '../../../domain/repositories/IVehicleTypeRepository';

/**
 * Use Case para actualizar un vehículo
 */
export class UpdateVehicleUseCase {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private vehicleTypeRepository: IVehicleTypeRepository
  ) {}

  async execute(
    vehicleId: string,
    updates: {
      vehicleTypeId?: string;
      brand?: string;
      model?: string;
      year?: number;
      licensePlate?: string;
      color?: string;
      imageUrl?: string;
    }
  ): Promise<Vehicle> {
    if (!vehicleId || vehicleId.trim() === '') {
      throw new Error('ID de vehículo requerido');
    }

    // Verificar que el vehículo existe
    const existingVehicle = await this.vehicleRepository.findById(vehicleId);
    if (!existingVehicle) {
      throw new Error('Vehículo no encontrado');
    }

    // Validar tipo de vehículo si se está actualizando
    if (updates.vehicleTypeId) {
      const vehicleType = await this.vehicleTypeRepository.findById(updates.vehicleTypeId);
      if (!vehicleType) {
        throw new Error('Tipo de vehículo no encontrado');
      }
      if (!vehicleType.isActive) {
        throw new Error('Tipo de vehículo no está activo');
      }
    }

    // Verificar que la placa no esté en uso por otro vehículo
    if (updates.licensePlate && updates.licensePlate !== existingVehicle.licensePlate) {
      const vehicleWithPlate = await this.vehicleRepository.findByLicensePlate(updates.licensePlate);
      if (vehicleWithPlate && vehicleWithPlate.id !== vehicleId) {
        throw new Error('Ya existe otro vehículo con esta placa');
      }
    }

    // Crear vehículo temporal para validaciones
    const tempVehicle = new Vehicle(
      existingVehicle.id,
      existingVehicle.userId,
      updates.vehicleTypeId || existingVehicle.vehicleTypeId,
      updates.licensePlate || existingVehicle.licensePlate,
      updates.brand || existingVehicle.brand,
      updates.model || existingVehicle.model,
      updates.year || existingVehicle.year,
      updates.color !== undefined ? updates.color : existingVehicle.color,
      existingVehicle.isActive,
      existingVehicle.createdAt,
      new Date()
    );

    // Validar las actualizaciones
    if (updates.brand !== undefined && (!tempVehicle.brand || tempVehicle.brand.trim().length === 0)) {
      throw new Error('Marca inválida');
    }

    if (updates.model !== undefined && (!tempVehicle.model || tempVehicle.model.trim().length === 0)) {
      throw new Error('Modelo inválido');
    }

    if (updates.year !== undefined && tempVehicle.year < 1886) {
      throw new Error('Año inválido');
    }

    if (updates.licensePlate !== undefined && (!tempVehicle.licensePlate || tempVehicle.licensePlate.trim().length === 0)) {
      throw new Error('Placa inválida');
    }
    // Actualizar en el repositorio
    return await this.vehicleRepository.update(tempVehicle);
  }
}