import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * Use Case para obtener un usuario por ID
 */
export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID de usuario requerido');
    }

    return await this.userRepository.findById(userId);
  }
}