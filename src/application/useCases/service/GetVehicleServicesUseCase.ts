import { Service } from '../../../domain/entities/Service';
import { IServiceRepository } from '../../../domain/repositories/IServiceRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

/**
 * Use Case para obtener todos los servicios de un vehículo
 */
export class GetVehicleServicesUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private vehicleRepository: IVehicleRepository
  ) {}

  async execute(vehicleId: string, userId?: string): Promise<Service[]> {
    if (!vehicleId || vehicleId.trim() === '') {
      throw new Error('ID de vehículo requerido');
    }

    // Verificar que el vehículo existe
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    // Si se proporciona userId, verificar que el vehículo pertenece al usuario
    if (userId && vehicle.userId !== userId) {
      throw new Error('No tienes permisos para ver los servicios de este vehículo');
    }

    return await this.serviceRepository.findByVehicleId(vehicleId);
  }
}