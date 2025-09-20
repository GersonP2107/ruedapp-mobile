import { supabase } from '../../../lib/supabase';
import { Vehicle } from '../../domain/entities/Vehicle';
import { IVehicleRepository } from '../../domain/repositories';

export class SupabaseVehicleRepository implements IVehicleRepository {
  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('license_plate', licensePlate)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Vehicle not found
      }
      throw new Error(`Error finding vehicle: ${error.message}`);
    }

    return new Vehicle(
      data.id,
      data.user_id,
      data.vehicle_type_id,
      data.license_plate,
      data.brand,
      data.model,
      data.year,
      data.color,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
  async create(vehicle: Vehicle): Promise<Vehicle> {  
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        id: vehicle.id,
        user_id: vehicle.userId,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.licensePlate,
        vehicle_type_id: vehicle.vehicleTypeId,
        created_at: vehicle.createdAt,
        updated_at: vehicle.updatedAt
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating vehicle: ${error.message}`);
    }

    return new Vehicle(
      data.id,
      data.user_id,
      data.vehicle_type_id,
      data.license_plate,
      data.brand,
      data.model,
      data.year,
      data.color,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Vehicle not found
      }
      throw new Error(`Error finding vehicle: ${error.message}`);
    }

    return new Vehicle(
      data.id,
      data.user_id,
      data.vehicle_type_id,
      data.license_plate,
      data.brand,
      data.model,
      data.year,
      data.color,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async findByUserId(userId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error finding vehicles by user: ${error.message}`);
    }

    return data.map(item => new Vehicle(
      item.id,
      item.user_id,
      item.vehicle_type_id,
      item.license_plate,
      item.brand,
      item.model,
      item.year,
      item.color,
      item.is_active,
      new Date(item.created_at),
      new Date(item.updated_at)
    ));
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.licensePlate,
        vehicle_type_id: vehicle.vehicleTypeId,
        color: vehicle.color,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicle.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating vehicle: ${error.message}`);
    }

    return new Vehicle(
      data.id,
      data.user_id,
      data.vehicle_type_id,
      data.license_plate,
      data.brand,
      data.model,
      data.year,
      data.color,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting vehicle: ${error.message}`);
    }
  }
}