import { Service } from '../../../domain/entities/Service';
import { IServiceRepository } from '../../../domain/repositories/IServiceRepository';
import { IServiceTypeRepository } from '../../../domain/repositories/IServiceTypeRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

/**
 * Use Case para actualizar un servicio
 */
export class UpdateServiceUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private vehicleRepository: IVehicleRepository,
    private serviceTypeRepository: IServiceTypeRepository
  ) {}

  async execute(
    serviceId: string,
    updates: {
      serviceTypeId?: string;
      description?: string;
      cost?: number;
      serviceDate?: Date;
      mileage?: number;
      notes?: string;
      providerId?: string;
    },
    userId?: string
  ): Promise<Service> {
    if (!serviceId || serviceId.trim() === '') {
      throw new Error('ID de servicio requerido');
    }

    // Verificar que el servicio existe
    const existingService = await this.serviceRepository.findById(serviceId);
    if (!existingService) {
      throw new Error('Servicio no encontrado');
    }

    // Si se proporciona userId, verificar permisos
    if (userId) {
      const vehicle = await this.vehicleRepository.findById(existingService.vehicleId);
      if (!vehicle) {
        throw new Error('Vehículo asociado no encontrado');
      }
      if (vehicle.userId !== userId) {
        throw new Error('No tienes permisos para actualizar este servicio');
      }
    }

    // Validar tipo de servicio si se está actualizando
    if (updates.serviceTypeId) {
      const serviceType = await this.serviceTypeRepository.findById(updates.serviceTypeId);
      if (!serviceType) {
        throw new Error('Tipo de servicio no encontrado');
      }
      if (!serviceType.isActive) {
        throw new Error('Tipo de servicio no está activo');
      }
    }

    // Crear servicio temporal para validaciones
    const tempService = new Service(
      existingService.id,
      existingService.vehicleId,
      updates.serviceTypeId || existingService.serviceTypeId,
      updates.description || existingService.description,
      updates.cost !== undefined ? updates.cost : existingService.cost,
      updates.serviceDate || existingService.serviceDate,
      updates.mileage !== undefined ? updates.mileage : existingService.mileage,
      updates.notes !== undefined ? updates.notes : existingService.notes,
      updates.providerId !== undefined ? updates.providerId : existingService.providerId,
      existingService.isCompleted,
      existingService.createdAt,
      new Date()
    );

    // Validar las actualizaciones
    if (updates.description !== undefined && (updates.description.trim().length === 0 || tempService.description !== updates.description)) {
      throw new Error('Descripción inválida');
    }

    if (updates.cost !== undefined && (updates.cost < 0 || tempService.cost !== updates.cost)) {
      throw new Error('Costo inválido');
    }

    if (updates.serviceDate !== undefined && (updates.serviceDate < new Date() || tempService.serviceDate !== updates.serviceDate)) {
      throw new Error('Fecha de servicio inválida');
    }

    if (updates.mileage !== undefined && (updates.mileage < 0 || tempService.mileage !== updates.mileage)) {
      throw new Error('Kilometraje inválido');
    }

    // Actualizar en el repositorio
    return await this.serviceRepository.update(tempService);
  }
}