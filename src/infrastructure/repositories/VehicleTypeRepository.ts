import { IVehicleTypeRepository } from '../../domain/repositories/IVehicleTypeRepository';
import { VehicleType } from '../../domain/entities/VehicleType';
import { supabase } from '../../../lib/supabase';

/**
 * Implementación del repositorio de tipos de vehículo usando Supabase
 */
export class VehicleTypeRepository implements IVehicleTypeRepository {
  private readonly tableName = 'vehicle_types';

  async findById(id: string): Promise<VehicleType | null> {
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
        throw new Error(`Error al buscar tipo de vehículo por ID: ${error.message}`);
      }

      return data ? VehicleType.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en VehicleTypeRepository.findById:', error);
      throw error;
    }
  }

  async findAll(): Promise<VehicleType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Error al obtener tipos de vehículo: ${error.message}`);
      }

      return data ? data.map(item => VehicleType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleTypeRepository.findAll:', error);
      throw error;
    }
  }

  async findActive(): Promise<VehicleType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error al obtener tipos de vehículo activos: ${error.message}`);
      }

      return data ? data.map(item => VehicleType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleTypeRepository.findActive:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<VehicleType | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error al buscar tipo de vehículo por nombre: ${error.message}`);
      }

      return data ? VehicleType.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en VehicleTypeRepository.findByName:', error);
      throw error;
    }
  }

  async create(vehicleType: VehicleType): Promise<VehicleType> {
    try {
      const vehicleTypeData = vehicleType.toPlainObject();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(vehicleTypeData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear tipo de vehículo: ${error.message}`);
      }

      return VehicleType.fromPlainObject(data);
    } catch (error) {
      console.error('Error en VehicleTypeRepository.create:', error);
      throw error;
    }
  }

  async update(vehicleType: VehicleType): Promise<VehicleType> {
    try {
      // Convertir el tipo de vehículo al formato de base de datos
      const updateData = {
        name: vehicleType.name,
        description: vehicleType.description,
        is_active: vehicleType.isActive,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', vehicleType.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar tipo de vehículo: ${error.message}`);
      }

      return VehicleType.fromPlainObject(data);
    } catch (error) {
      console.error('Error en VehicleTypeRepository.update:', error);
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
        throw new Error(`Error al eliminar tipo de vehículo: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en VehicleTypeRepository.delete:', error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<VehicleType> {
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
        throw new Error(`Error al desactivar tipo de vehículo: ${error.message}`);
      }

      return VehicleType.fromPlainObject(data);
    } catch (error) {
      console.error('Error en VehicleTypeRepository.deactivate:', error);
      throw error;
    }
  }

  async searchByDescription(description: string): Promise<VehicleType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('description', `%${description}%`)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error al buscar tipos de vehículo por descripción: ${error.message}`);
      }

      return data ? data.map(item => VehicleType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en VehicleTypeRepository.searchByDescription:', error);
      throw error;
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('name', name)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error al verificar existencia de nombre: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error en VehicleTypeRepository.existsByName:', error);
      throw error;
    }
  }
}