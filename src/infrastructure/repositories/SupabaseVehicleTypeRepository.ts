import { supabase } from '../../../lib/supabase';
import { VehicleType } from '../../domain/entities/VehicleType';
import { IVehicleTypeRepository } from '../../domain/repositories';

export class SupabaseVehicleTypeRepository implements IVehicleTypeRepository {
  async findAll(): Promise<VehicleType[]> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching vehicle types: ${error.message}`);
    }

    return data.map(item => new VehicleType(
      item.id,
      item.name,
      item.description,
      item.is_active,
      new Date(item.created_at),
      new Date(item.updated_at)
    ));
  }

  async findById(id: string): Promise<VehicleType | null> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Vehicle type not found
      }
      throw new Error(`Error finding vehicle type: ${error.message}`);
    }

    return new VehicleType(
      data.id,
      data.name,
      data.description,
      data.is_active,
      new Date(data.created_at),  
      new Date(data.updated_at)
    );
  }

  async create(vehicleType: VehicleType): Promise<VehicleType> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .insert({
        id: vehicleType.id,
        name: vehicleType.name,
        description: vehicleType.description,
        created_at: vehicleType.createdAt,
        updated_at: vehicleType.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating vehicle type: ${error.message}`);
    }

    return new VehicleType(
      data.id,
      data.name,
      data.description,
      
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async update(vehicleType: VehicleType): Promise<VehicleType> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .update({
        name: vehicleType.name,
        description: vehicleType.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleType.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating vehicle type: ${error.message}`);
    }

    return new VehicleType(
      data.id,
      data.name,
      data.description,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_types')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting vehicle type: ${error.message}`);
    }
  }
}