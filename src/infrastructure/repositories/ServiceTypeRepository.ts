import { IServiceTypeRepository } from '../../domain/repositories/IServiceTypeRepository';
import { ServiceType } from '../../domain/entities/ServiceType';
import { supabase } from '../../../lib/supabase';

/**
 * Implementación del repositorio de tipos de servicio usando Supabase
 */
export class ServiceTypeRepository implements IServiceTypeRepository {
  private readonly tableName = 'service_types';

  async findById(id: string): Promise<ServiceType | null> {
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
        throw new Error(`Error al buscar tipo de servicio por ID: ${error.message}`);
      }

      return data ? ServiceType.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findById:', error);
      throw error;
    }
  }

  async findAll(): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Error al obtener tipos de servicio: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findAll:', error);
      throw error;
    }
  }

  async findActive(): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error al obtener tipos de servicio activos: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findActive:', error);
      throw error;
    }
  }

  async findByCategory(category: string): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error al obtener tipos de servicio por categoría: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findByCategory:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<ServiceType | null> {
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
        throw new Error(`Error al buscar tipo de servicio por nombre: ${error.message}`);
      }

      return data ? ServiceType.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findByName:', error);
      throw error;
    }
  }

  async create(serviceType: ServiceType): Promise<ServiceType> {
    try {
      const serviceTypeData = serviceType.toPlainObject();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(serviceTypeData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear tipo de servicio: ${error.message}`);
      }

      return ServiceType.fromPlainObject(data);
    } catch (error) {
      console.error('Error en ServiceTypeRepository.create:', error);
      throw error;
    }
  }

  async update(serviceType: ServiceType): Promise<ServiceType> {
    try {
      // Convertir el tipo de servicio al formato de base de datos
      const updateData: any = {
        name: serviceType.name,
        description: serviceType.description,
        category: serviceType.category,
        estimated_duration: serviceType.estimatedDuration,
        average_cost: serviceType.averageCost,
        is_active: serviceType.isActive,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', serviceType.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar tipo de servicio: ${error.message}`);
      }

      return ServiceType.fromPlainObject(data);
    } catch (error) {
      console.error('Error en ServiceTypeRepository.update:', error);
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
        throw new Error(`Error al eliminar tipo de servicio: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en ServiceTypeRepository.delete:', error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<ServiceType> {
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
        throw new Error(`Error al desactivar tipo de servicio: ${error.message}`);
      }

      return ServiceType.fromPlainObject(data);
    } catch (error) {
      console.error('Error en ServiceTypeRepository.deactivate:', error);
      throw error;
    }
  }

  async searchByDescription(description: string): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('description', `%${description}%`)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error al buscar tipos de servicio por descripción: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.searchByDescription:', error);
      throw error;
    }
  }

  async findByCostRange(minCost: number, maxCost: number): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gte('average_cost', minCost)
        .lte('average_cost', maxCost)
        .eq('is_active', true)
        .order('average_cost');

      if (error) {
        throw new Error(`Error al buscar tipos de servicio por rango de costo: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findByCostRange:', error);
      throw error;
    }
  }

  async findByDurationRange(minDuration: number, maxDuration: number): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gte('estimated_duration', minDuration)
        .lte('estimated_duration', maxDuration)
        .eq('is_active', true)
        .order('estimated_duration');

      if (error) {
        throw new Error(`Error al buscar tipos de servicio por rango de duración: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findByDurationRange:', error);
      throw error;
    }
  }

  async findPreventiveMaintenance(): Promise<ServiceType[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', 'Mantenimiento Preventivo')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error al obtener tipos de mantenimiento preventivo: ${error.message}`);
      }

      return data ? data.map(item => ServiceType.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceTypeRepository.findPreventiveMaintenance:', error);
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
      console.error('Error en ServiceTypeRepository.existsByName:', error);
      throw error;
    }
  }

  async getAvailableCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category')
        .eq('is_active', true)
        .order('category');

      if (error) {
        throw new Error(`Error al obtener categorías disponibles: ${error.message}`);
      }

      // Obtener categorías únicas
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      return uniqueCategories;
    } catch (error) {
      console.error('Error en ServiceTypeRepository.getAvailableCategories:', error);
      throw error;
    }
  }
}