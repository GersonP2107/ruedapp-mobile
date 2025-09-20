import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

/**
 * Use Case para crear un nuevo usuario
 */
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userData: {
    email: string;
    name: string;
    phone?: string;
    profileImageUrl?: string;
  }): Promise<User> {
    // Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    // Crear nueva instancia de User
    const user = new User(
      '', // ID será generado por la base de datos
      userData.email,
      userData.name,
      userData.phone,
      userData.profileImageUrl,
      new Date().toISOString(),
      new Date()
    );

    // Validar la entidad
    if (!user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Email inválido');
    }

    if (!userData.name.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)) {
      throw new Error('Nombre inválido');
    }

    if (userData.phone && !userData.phone.match(/^\d{10}$/)) {
      throw new Error('Teléfono inválido');
    }

    // Guardar en el repositorio
    return await this.userRepository.create(user);
  }
}