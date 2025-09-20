import { useEffect, useState } from 'react';
import { CreateVehicleUseCase } from '../../application/useCases/vehicle/CreateVehicleUseCase';
import { DeleteVehicleUseCase } from '../../application/useCases/vehicle/DeleteVehicleUseCase';
import { GetUserVehiclesUseCase } from '../../application/useCases/vehicle/GetUserVehiclesUseCase';
import { UpdateVehicleUseCase } from '../../application/useCases/vehicle/UpdateVehicleUseCase';
import { Vehicle } from '../../domain/entities/Vehicle';
import { useAuth } from '../../infrastructure/context/AuthContext';
import {
  SupabaseServiceRepository,
  SupabaseUserRepository,
  SupabaseVehicleRepository,
  SupabaseVehicleTypeRepository
} from '../../infrastructure/repositories';

export const useVehicleManagement = () => {
  const { supabaseUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Repositories
  const vehicleRepository = new SupabaseVehicleRepository();
  const userRepository = new SupabaseUserRepository();
  const vehicleTypeRepository = new SupabaseVehicleTypeRepository();
  const serviceRepository = new SupabaseServiceRepository();

  // Use Cases
  const createVehicleUseCase = new CreateVehicleUseCase(
    vehicleRepository,
    userRepository,
    vehicleTypeRepository
  );
  const getUserVehiclesUseCase = new GetUserVehiclesUseCase(
    vehicleRepository,
    userRepository
  );
  const updateVehicleUseCase = new UpdateVehicleUseCase(
    vehicleRepository,
    vehicleTypeRepository
  );
  const deleteVehicleUseCase = new DeleteVehicleUseCase(
    vehicleRepository,
    serviceRepository
  );

  const fetchVehicles = async () => {
    if (!supabaseUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserVehiclesUseCase.execute(supabaseUser.id);
      setVehicles(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    mileage: number;
    vehicleTypeId: string;
  }) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const vehicle = await createVehicleUseCase.execute({
        ...vehicleData,
        userId: supabaseUser.id
      });
      
      await fetchVehicles(); // Refrescar lista
      return { success: true, data: vehicle };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (vehicleId: string, updates: Partial<{
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    mileage: number;
    vehicleTypeId: string;
  }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const vehicle = await updateVehicleUseCase.execute(vehicleId, updates);
      
      await fetchVehicles(); // Refrescar lista
      return { success: true, data: vehicle };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteVehicleUseCase.execute(vehicleId, supabaseUser.id);
      
      await fetchVehicles(); // Refrescar lista
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabaseUser) {
      fetchVehicles();
    }
  }, [supabaseUser]);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
};