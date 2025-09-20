import { useState } from 'react';
import { CompleteServiceUseCase } from '../../application/useCases/service/CompleteServiceUseCase';
import { CreateServiceUseCase } from '../../application/useCases/service/CreateServiceUseCase';
import { GetVehicleServicesUseCase } from '../../application/useCases/service/GetVehicleServicesUseCase';
import { UpdateServiceUseCase } from '../../application/useCases/service/UpdateServiceUseCase';
import { Service } from '../../domain/entities/Service';
import { useAuth } from '../../infrastructure/context/AuthContext';
import {
  SupabaseServiceRepository,
  SupabaseServiceTypeRepository,
  SupabaseVehicleRepository
} from '../../infrastructure/repositories';

export const useServiceManagement = () => {
  const { supabaseUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Repositories
  const serviceRepository = new SupabaseServiceRepository();
  const vehicleRepository = new SupabaseVehicleRepository();
  const serviceTypeRepository = new SupabaseServiceTypeRepository();

  // Use Cases
  const createServiceUseCase = new CreateServiceUseCase(
    serviceRepository,
    vehicleRepository,
    serviceTypeRepository
  );
  const getVehicleServicesUseCase = new GetVehicleServicesUseCase(
    serviceRepository,
    vehicleRepository
  );
  const completeServiceUseCase = new CompleteServiceUseCase(
    serviceRepository,
    vehicleRepository
  );
  const updateServiceUseCase = new UpdateServiceUseCase(
    serviceRepository,
    vehicleRepository,
    serviceTypeRepository
  );

  const fetchVehicleServices = async (vehicleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = supabaseUser?.id;
      const result = await getVehicleServicesUseCase.execute(vehicleId, userId);
      setServices(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: {
    vehicleId: string;
    serviceTypeId: string;
    description: string;
    cost: number;
    serviceDate: Date;
    mileage: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const service = await createServiceUseCase.execute(serviceData);
      
      // Refrescar lista si estamos viendo servicios del mismo vehículo
      if (services.length > 0 && services[0].vehicleId === serviceData.vehicleId) {
        await fetchVehicleServices(serviceData.vehicleId);
      }
      
      return { success: true, data: service };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const completeService = async (serviceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = supabaseUser?.id;
      const service = await completeServiceUseCase.execute(serviceId, userId);
      
      // Refrescar lista
      if (services.length > 0) {
        await fetchVehicleServices(services[0].vehicleId);
      }
      
      return { success: true, data: service };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId: string, updates: Partial<{
    serviceTypeId: string;
    description: string;
    cost: number;
    serviceDate: Date;
    mileage: number;
  }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = supabaseUser?.id;
      const service = await updateServiceUseCase.execute(serviceId, updates, userId);
      
      // Refrescar lista
      if (services.length > 0) {
        await fetchVehicleServices(services[0].vehicleId);
      }
      
      return { success: true, data: service };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    fetchVehicleServices,
    createService,
    completeService,
    updateService
  };
};