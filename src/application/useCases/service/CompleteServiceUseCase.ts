import { Service } from '../../../domain/entities/Service';
import { IServiceRepository } from '../../../domain/repositories/IServiceRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

/**
 * Use Case para marcar un servicio como completado
 */
export class CompleteServiceUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private vehicleRepository: IVehicleRepository
  ) {}

  async execute(serviceId: string, userId?: string): Promise<Service> {
    if (!serviceId || serviceId.trim() === '') {
      throw new Error('ID de servicio requerido');
    }

    // Verificar que el servicio existe
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    // Si se proporciona userId, verificar permisos
    if (userId) {
      const vehicle = await this.vehicleRepository.findById(service.vehicleId);
      if (!vehicle) {
        throw new Error('Vehículo asociado no encontrado');
      }
      if (vehicle.userId !== userId) {
        throw new Error('No tienes permisos para completar este servicio');
      }
    }

    // Verificar que el servicio no esté ya completado
    if (service.isCompleted) {
      throw new Error('El servicio ya está completado');
    }

    // Marcar como completado
    const completedService = service.markAsCompleted();
    
    // Actualizar en el repositorio
    return await this.serviceRepository.update(completedService);
  }
}