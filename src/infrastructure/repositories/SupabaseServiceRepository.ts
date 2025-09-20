import { IServiceRepository } from '../../domain/repositories/IServiceRepository';
import { Service } from '../../domain/entities/Service';
import { supabase } from '../../../lib/supabase';

export class SupabaseServiceRepository implements IServiceRepository {
  async create(service: Service): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        id: service.id,
        vehicle_id: service.vehicleId,
        service_type_id: service.serviceTypeId,
        description: service.description,
        cost: service.cost,
        service_date: service.serviceDate,
        mileage: service.mileage,
        notes: service.notes,
        provider_id: service.providerId,
        is_completed: service.isCompleted,
        created_at: service.createdAt,
        updated_at: service.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }

    return new Service(
      data.id,
      data.vehicle_id,
      data.service_type_id,
      data.description,
      data.cost,
      new Date(data.service_date),
      data.mileage,
      data.notes,
      data.provider_id,
      data.is_completed,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Service not found
      }
      throw new Error(`Error finding service: ${error.message}`);
    }

    return new Service(
      data.id,
      data.vehicle_id,
      data.service_type_id,
      data.description,
      data.cost,
      new Date(data.service_date),
      data.mileage,
      data.notes,
      data.provider_id,
      data.is_completed,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findByVehicleId(vehicleId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('service_date', { ascending: false });

    if (error) {
      throw new Error(`Error finding services by vehicle: ${error.message}`);
    }

    return data.map(item => new Service(
      item.id,
      item.vehicle_id,
      item.service_type_id,
      item.description,
      item.cost,
      new Date(item.service_date),
      item.mileage,
      item.notes,
      item.provider_id,
      item.is_completed,
      new Date(item.created_at),
      new Date(item.updated_at)
    ));
  }

  async update(service: Service): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update({
        service_type_id: service.serviceTypeId,
        description: service.description,
        cost: service.cost,
        service_date: service.serviceDate,
        mileage: service.mileage,
        notes: service.notes,
        provider_id: service.providerId,
        is_completed: service.isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', service.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }

    return new Service(
      data.id,
      data.vehicle_id,
      data.service_type_id,
      data.description,
      data.cost,
      new Date(data.service_date),
      data.mileage,
      data.notes,
      data.provider_id,
      data.is_completed,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }
}