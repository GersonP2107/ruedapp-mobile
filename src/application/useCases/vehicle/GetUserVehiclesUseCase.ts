import { Vehicle } from '../../../domain/entities/Vehicle';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * Use Case para obtener todos los vehículos de un usuario
 */
export class GetUserVehiclesUseCase {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<Vehicle[]> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID de usuario requerido');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return await this.vehicleRepository.findByUserId(userId);
  }
}