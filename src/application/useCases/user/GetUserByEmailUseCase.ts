import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * Use Case para obtener un usuario por email
 */
export class GetUserByEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string): Promise<User | null> {
    if (!email || email.trim() === '') {
      throw new Error('Email requerido');
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    return await this.userRepository.findByEmail(email);
  }
}