import { User } from '../entities/User';

/**
 * Interfaz del repositorio de usuarios
 * Define los contratos para el acceso a datos de usuarios
 */
export interface IUserRepository {
  /**
   * Obtiene un usuario por su ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Obtiene un usuario por su email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Crea un nuevo usuario
   */
  create(user: User): Promise<User>;

  /**
   * Actualiza un usuario existente
   */
  update(user: User): Promise<User>;

  /**
   * Elimina un usuario
   */
  delete(id: string): Promise<void>;

  /**
   * Obtiene todos los usuarios (con paginación opcional)
   */
  findAll(limit?: number, offset?: number): Promise<User[]>;

  /**
   * Busca usuarios por nombre
   */
  searchByName(name: string): Promise<User[]>;

  /**
   * Verifica si existe un usuario con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;
}