import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { supabase } from '../../../lib/supabase';

/**
 * Implementación del repositorio de vehículos usando Supabase
 */
export class VehicleRepository implements IVehicleRepository {
  private readonly tableName = 'vehicles';

  async findById(id: string): Promise<Vehicle | null> {
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
        throw new Error(`Error al buscar vehículo por ID: ${error.message}`);
      }

      return data ? Vehicle.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en VehicleRepository.findById:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar vehículos por usuario: ${error.message}`);
      }

      return data ? data.map(item => Vehicle.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleRepository.findByUserId:', error);
      throw error;
    }
  }

  async findByVehicleTypeId(vehicleTypeId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('vehicle_type_id', vehicleTypeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar vehículos por tipo: ${error.message}`);
      }

      return data ? data.map(item => Vehicle.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleRepository.findByVehicleTypeId:', error);
      throw error;
    }
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('license_plate', licensePlate.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error al buscar vehículo por placa: ${error.message}`);
      }

      return data ? Vehicle.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en VehicleRepository.findByLicensePlate:', error);
      throw error;
    }
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    try {
      const vehicleData = vehicle.toPlainObject();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(vehicleData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear vehículo: ${error.message}`);
      }

      return Vehicle.fromPlainObject(data);
    } catch (error) {
      console.error('Error en VehicleRepository.create:', error);
      throw error;
    }
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    try {
      // Convertir el vehículo al formato de base de datos
      const updateData = {
        vehicle_type_id: vehicle.vehicleTypeId,
        license_plate: vehicle.licensePlate.toUpperCase(),
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        is_active: vehicle.isActive,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', vehicle.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar vehículo: ${error.message}`);
      }

      return Vehicle.fromPlainObject(data);
    } catch (error) {
      console.error('Error en VehicleRepository.update:', error);
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
        throw new Error(`Error al eliminar vehículo: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en VehicleRepository.delete:', error);
      throw error;
    }
  }

  async findActiveByUserId(userId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar vehículos activos: ${error.message}`);
      }

      return data ? data.map(item => Vehicle.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleRepository.findActiveByUserId:', error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al desactivar vehículo: ${error.message}`);
      }

      return Vehicle.fromPlainObject(data);
    } catch (error) {
      console.error('Error en VehicleRepository.deactivate:', error);
      throw error;
    }
  }

  async searchByBrandAndModel(brand: string, model: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('brand', `%${brand}%`)
        .ilike('model', `%${model}%`)
        .eq('is_active', true)
        .order('year', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar vehículos por marca y modelo: ${error.message}`);
      }

      return data ? data.map(item => Vehicle.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleRepository.searchByBrandAndModel:', error);
      throw error;
    }
  }

  async findByYearRange(startYear: number, endYear: number): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gte('year', startYear)
        .lte('year', endYear)
        .eq('is_active', true)
        .order('year', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar vehículos por rango de años: ${error.message}`);
      }

      return data ? data.map(item => Vehicle.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleRepository.findByYearRange:', error);
      throw error;
    }
  }

  async existsByLicensePlate(licensePlate: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('license_plate', licensePlate.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error al verificar existencia de placa: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error en VehicleRepository.existsByLicensePlate:', error);
      throw error;
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Error al contar vehículos: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error en VehicleRepository.countByUserId:', error);
      throw error;
    }
  }
}