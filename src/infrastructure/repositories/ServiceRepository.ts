import { IServiceRepository } from '../../domain/repositories/IServiceRepository';
import { Service } from '../../domain/entities/Service';
import { supabase } from '../../../lib/supabase';

/**
 * Implementación del repositorio de servicios usando Supabase
 */
export class ServiceRepository implements IServiceRepository {
  private readonly tableName = 'services';

  async findById(id: string): Promise<Service | null> {
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
        throw new Error(`Error al buscar servicio por ID: ${error.message}`);
      }

      return data ? Service.fromPlainObject(data) : null;
    } catch (error) {
      console.error('Error en ServiceRepository.findById:', error);
      throw error;
    }
  }

  async findByVehicleId(vehicleId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por vehículo: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findByVehicleId:', error);
      throw error;
    }
  }

  async findByServiceTypeId(serviceTypeId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('service_type_id', serviceTypeId)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por tipo: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findByServiceTypeId:', error);
      throw error;
    }
  }

  async findByProviderId(providerId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('provider_id', providerId)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por proveedor: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findByProviderId:', error);
      throw error;
    }
  }

  async create(service: Service): Promise<Service> {
    try {
      const serviceData = service.toPlainObject();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear servicio: ${error.message}`);
      }

      return Service.fromPlainObject(data);
    } catch (error) {
      console.error('Error en ServiceRepository.create:', error);
      throw error;
    }
  }

  async update(service: Service): Promise<Service> {
    try {
      // Convertir el servicio al formato de base de datos
      const updateData: any = {
        description: service.description,
        cost: service.cost,
        service_date: service.serviceDate.toISOString(),
        mileage: service.mileage,
        notes: service.notes,
        provider_id: service.providerId,
        is_completed: service.isCompleted,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', service.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar servicio: ${error.message}`);
      }

      return Service.fromPlainObject(data);
    } catch (error) {
      console.error('Error en ServiceRepository.update:', error);
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
        throw new Error(`Error al eliminar servicio: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en ServiceRepository.delete:', error);
      throw error;
    }
  }

  async findCompletedByVehicleId(vehicleId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('is_completed', true)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios completados: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findCompletedByVehicleId:', error);
      throw error;
    }
  }

  async findPendingByVehicleId(vehicleId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('is_completed', false)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios pendientes: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findPendingByVehicleId:', error);
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, vehicleId?: string): Promise<Service[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .gte('service_date', startDate.toISOString())
        .lte('service_date', endDate.toISOString());

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query.order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por rango de fechas: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findByDateRange:', error);
      throw error;
    }
  }

  async findByCostRange(minCost: number, maxCost: number, vehicleId?: string): Promise<Service[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .gte('cost', minCost)
        .lte('cost', maxCost);

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query.order('cost', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por rango de costos: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findByCostRange:', error);
      throw error;
    }
  }

  async findRecentByVehicleId(vehicleId: string, limit: number = 10): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error al buscar servicios recientes: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findRecentByVehicleId:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          vehicles!inner(user_id)
        `)
        .eq('vehicles.user_id', userId)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por usuario: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.findByUserId:', error);
      throw error;
    }
  }

  async getTotalCostByVehicleId(vehicleId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('cost')
        .eq('vehicle_id', vehicleId)
        .eq('is_completed', true);

      if (error) {
        throw new Error(`Error al calcular costo total: ${error.message}`);
      }

      return data ? data.reduce((total, service) => total + service.cost, 0) : 0;
    } catch (error) {
      console.error('Error en ServiceRepository.getTotalCostByVehicleId:', error);
      throw error;
    }
  }

  async getServiceStatsByVehicleId(vehicleId: string): Promise<{
    totalServices: number;
    totalCost: number;
    averageCost: number;
    lastServiceDate?: Date;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('cost, service_date')
        .eq('vehicle_id', vehicleId)
        .eq('is_completed', true)
        .order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          totalServices: 0,
          totalCost: 0,
          averageCost: 0
        };
      }

      const totalServices = data.length;
      const totalCost = data.reduce((total, service) => total + service.cost, 0);
      const averageCost = totalCost / totalServices;
      const lastServiceDate = new Date(data[0].service_date);

      return {
        totalServices,
        totalCost,
        averageCost,
        lastServiceDate
      };
    } catch (error) {
      console.error('Error en ServiceRepository.getServiceStatsByVehicleId:', error);
      throw error;
    }
  }

  async markAsCompleted(id: string): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al marcar servicio como completado: ${error.message}`);
      }

      return Service.fromPlainObject(data);
    } catch (error) {
      console.error('Error en ServiceRepository.markAsCompleted:', error);
      throw error;
    }
  }

  async searchByDescription(description: string, vehicleId?: string): Promise<Service[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .ilike('description', `%${description}%`);

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query.order('service_date', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar servicios por descripción: ${error.message}`);
      }

      return data ? data.map(item => Service.fromPlainObject(item)) : [];
    } catch (error) {
      console.error('Error en ServiceRepository.searchByDescription:', error);
      throw error;
    }
  }
}