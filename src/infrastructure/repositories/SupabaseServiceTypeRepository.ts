import { IServiceTypeRepository } from '../../domain/repositories';
import { ServiceType } from '../../domain/entities/ServiceType';
import { supabase } from '../../../lib/supabase';

export class SupabaseServiceTypeRepository implements IServiceTypeRepository {
  async findAll(): Promise<ServiceType[]> {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching service types: ${error.message}`);
    }

    return data.map(item => new ServiceType(
      item.id,
      item.name,
      item.description,
      item.category,
      item.estimated_duration,
      item.average_cost,
      item.is_active,
      new Date(item.created_at),
      new Date(item.updated_at)
    ));
  }

  async findById(id: string): Promise<ServiceType | null> {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Service type not found
      }
      throw new Error(`Error finding service type: ${error.message}`);
    }

    return new ServiceType(
      data.id,
      data.name,
      data.description,
      data.category,
      data.estimated_duration,
      data.average_cost,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findByCategory(category: string): Promise<ServiceType[]> {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching service types by category: ${error.message}`);
    }

    return data.map(item => new ServiceType(
      item.id,
      item.name,
      item.description,
      item.category,
      item.estimated_duration,
      item.average_cost,
      item.is_active,
      new Date(item.created_at),
      new Date(item.updated_at)
    ));
  }

  async create(serviceType: ServiceType): Promise<ServiceType> {
    const { data, error } = await supabase
      .from('service_types')
      .insert({
        name: serviceType.name,
        description: serviceType.description,
        category: serviceType.category,
        estimated_duration: serviceType.estimatedDuration,
        average_cost: serviceType.averageCost,
        is_active: serviceType.isActive
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating service type: ${error.message}`);
    }

    return new ServiceType(
      data.id,
      data.name,
      data.description,
      data.category,
      data.estimated_duration,
      data.average_cost,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async update(serviceType: ServiceType): Promise<ServiceType> {
    const { data, error } = await supabase
      .from('service_types')
      .update({
        name: serviceType.name,
        description: serviceType.description,
        category: serviceType.category,
        estimated_duration: serviceType.estimatedDuration,
        average_cost: serviceType.averageCost,
        is_active: serviceType.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceType.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating service type: ${error.message}`);
    }

    return new ServiceType(
      data.id,
      data.name,
      data.description,
      data.category,
      data.estimated_duration,
      data.average_cost,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_types')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting service type: ${error.message}`);
    }
  }
}