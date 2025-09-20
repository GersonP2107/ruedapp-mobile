import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { supabase } from '../../../lib/supabase';

/**
 * Implementación del repositorio de usuarios usando Supabase
 */
export class UserRepository implements IUserRepository {
  private readonly tableName = 'profiles';

  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error al buscar usuario por ID: ${error.message}`);
      }

      return data ? User.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en UserRepository.findById:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error al buscar usuario por email: ${error.message}`);
      }

      return data ? User.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en UserRepository.findByEmail:', error);
      throw error;
    }
  }

  async create(user: User): Promise<User> {
    try {
      const userData = user.toPlainObject();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(userData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear usuario: ${error.message}`);
      }

      return User.fromPlainObject(data);
    } catch (error) {
      console.error('Error en UserRepository.create:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      // Convertir las actualizaciones al formato de base de datos
      const updateData: any = {};
      
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.city !== undefined) updateData.city = updates.city;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }

      return User.fromPlainObject(data);
    } catch (error) {
      console.error('Error en UserRepository.update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error al eliminar usuario: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en UserRepository.delete:', error);
      throw error;
    }
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error al obtener usuarios: ${error.message}`);
      }

      return data ? data.map(item => User.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en UserRepository.findAll:', error);
      throw error;
    }
  }

  async searchByName(name: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('full_name', `%${name}%`)
        .order('full_name');

      if (error) {
        throw new Error(`Error al buscar usuarios por nombre: ${error.message}`);
      }

      return data ? data.map(item => User.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en UserRepository.searchByName:', error);
      throw error;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error al verificar existencia de email: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error en UserRepository.existsByEmail:', error);
      throw error;
    }
  }
}