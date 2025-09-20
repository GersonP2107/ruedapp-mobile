import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * Use Case para actualizar un usuario
 */
export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    updates: {
      name?: string;
      phone?: string;
      profileImageUrl?: string;
    }
  ): Promise<User> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID de usuario requerido');
    }

    // Verificar que el usuario existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Validar las actualizaciones
    if (updates.name !== undefined) {
      const tempUser = existingUser.updateProfile({
        fullName: updates.name,
        phone: existingUser.phone,
      });
      
      if (!tempUser.isValid()) {
        throw new Error('Nombre inválido');
      }
    }

    if (updates.phone !== undefined) {
      const tempUser = existingUser.updateProfile({
        fullName: existingUser.fullName,
        phone: updates.phone,
      });
      
      if (updates.phone && !tempUser.isValid()) {
        throw new Error('Teléfono inválido');
      }
    }

    // Actualizar en el repositorio
    return await this.userRepository.update(existingUser);
  }
}