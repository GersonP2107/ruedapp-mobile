import { Service } from '../../../domain/entities/Service';
import { IServiceRepository } from '../../../domain/repositories/IServiceRepository';
import { IServiceTypeRepository } from '../../../domain/repositories/IServiceTypeRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

/**
 * Use Case para crear un nuevo servicio
 */
export class CreateServiceUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private vehicleRepository: IVehicleRepository,
    private serviceTypeRepository: IServiceTypeRepository
  ) {}

  async execute(serviceData: {
    vehicleId: string;
    serviceTypeId: string;
    description: string;
    cost: number;
    serviceDate: Date;
    mileage?: number;
    notes?: string;
    providerId?: string;
  }): Promise<Service> {
    // Validar que el vehículo existe
    const vehicle = await this.vehicleRepository.findById(serviceData.vehicleId);
    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    // Validar que el tipo de servicio existe y está activo
    const serviceType = await this.serviceTypeRepository.findById(serviceData.serviceTypeId);
    if (!serviceType) {
      throw new Error('Tipo de servicio no encontrado');
    }
    if (!serviceType.isActive) {
      throw new Error('Tipo de servicio no está activo');
    }

    // Crear nueva instancia de Service
    const service = new Service(
      '', // ID será generado por la base de datos
      serviceData.vehicleId,
      serviceData.serviceTypeId,
      serviceData.description,
      serviceData.cost,
      serviceData.serviceDate,
      serviceData.mileage,
      serviceData.notes,
      serviceData.providerId,
      false, // isCompleted por defecto false
      new Date(),
      new Date()
    );

    // Validar la entidad
    if (!service.description || service.description.trim().length === 0) {
      throw new Error('Descripción inválida');
    }

    if (service.cost < 0) {
      throw new Error('Costo inválido');
    }

    if (service.serviceDate < new Date()) {
      throw new Error('Fecha de servicio inválida');
    }

    if (serviceData.mileage !== undefined && serviceData.mileage < 0) {
      throw new Error('Kilometraje inválido');
    }

    // Guardar en el repositorio
    return await this.serviceRepository.create(service);
  }
}