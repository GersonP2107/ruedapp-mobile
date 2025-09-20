import { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/User';
import { supabase } from '../../../lib/supabase';

export class SupabaseUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        address: user.address,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return new User(
      data.id,
      data.email,
      data.full_name,
      data.phone,
      data.address,
      data.city,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Error finding user: ${error.message}`);
    }

    return new User(
      data.id,
      data.email,
      data.full_name,
      data.phone,
      data.address,
      data.city,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Error finding user by email: ${error.message}`);
    }

    return new User(
      data.id,
      data.email,
      data.full_name,
      data.phone,
      data.address,
      data.city,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async update(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return new User(
      data.id,
      data.email,
      data.full_name,
      data.phone,
      data.address,
      data.city,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}