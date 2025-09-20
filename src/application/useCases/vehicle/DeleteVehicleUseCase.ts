import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { IServiceRepository } from '../../../domain/repositories/IServiceRepository';

/**
 * Use Case para eliminar un vehículo
 */
export class DeleteVehicleUseCase {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private serviceRepository: IServiceRepository
  ) {}

  async execute(vehicleId: string, userId: string): Promise<void> {
    if (!vehicleId || vehicleId.trim() === '') {
      throw new Error('ID de vehículo requerido');
    }

    if (!userId || userId.trim() === '') {
      throw new Error('ID de usuario requerido');
    }

    // Verificar que el vehículo existe
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    // Verificar que el vehículo pertenece al usuario
    if (vehicle.userId !== userId) {
      throw new Error('No tienes permisos para eliminar este vehículo');
    }

    // Verificar si el vehículo tiene servicios asociados
    const services = await this.serviceRepository.findByVehicleId(vehicleId);
    if (services.length > 0) {
      throw new Error('No se puede eliminar el vehículo porque tiene servicios asociados');
    }

    // Eliminar el vehículo
    await this.vehicleRepository.delete(vehicleId);
  }
}