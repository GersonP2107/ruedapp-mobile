import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Interfaces
interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  color?: string;
  mileage: number;
  vehicle_type_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<Vehicle[]>;
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateVehicle: (vehicleId: string, vehicleData: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  refreshVehicles: () => Promise<void>;
}

export function useVehicles(): UseVehiclesReturn {
  const { supabaseUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicleState] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener vehículos del usuario
  const fetchVehicles = useCallback(async (): Promise<Vehicle[]> => {
    if (!supabaseUser) {
      setVehicles([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const vehicleList = data || [];
      setVehicles(vehicleList);
      
      // Si no hay vehículo activo y hay vehículos, seleccionar el primero
      if (!activeVehicle && vehicleList.length > 0) {
        setActiveVehicleState(vehicleList[0]);
      }
      
      return vehicleList;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener los vehículos';
      setError(errorMessage);
      console.error('Error fetching vehicles:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, activeVehicle]);

  // Agregar vehículo
  const addVehicle = useCallback(async (
    vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (!supabaseUser) {
      setError('Usuario no autenticado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleData,
          user_id: supabaseUser.id,
          is_active: true
        }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Refrescar la lista de vehículos
      await fetchVehicles();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al agregar el vehículo';
      setError(errorMessage);
      console.error('Error adding vehicle:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, fetchVehicles]);

  // Actualizar vehículo
  const updateVehicle = useCallback(async (
    vehicleId: string, 
    vehicleData: Partial<Vehicle>
  ): Promise<boolean> => {
    if (!supabaseUser) {
      setError('Usuario no autenticado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({
          ...vehicleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)
        .eq('user_id', supabaseUser.id);

      if (updateError) {
        throw updateError;
      }

      // Refrescar la lista de vehículos
      await fetchVehicles();
      
      // Actualizar vehículo activo si es el que se modificó
      if (activeVehicle?.id === vehicleId) {
        const updatedVehicle = vehicles.find(v => v.id === vehicleId);
        if (updatedVehicle) {
          setActiveVehicleState({ ...updatedVehicle, ...vehicleData });
        }
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el vehículo';
      setError(errorMessage);
      console.error('Error updating vehicle:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, fetchVehicles, activeVehicle, vehicles]);

  // Eliminar vehículo (soft delete)
  const deleteVehicle = useCallback(async (vehicleId: string): Promise<boolean> => {
    if (!supabaseUser) {
      setError('Usuario no autenticado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('vehicles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)
        .eq('user_id', supabaseUser.id);

      if (deleteError) {
        throw deleteError;
      }

      // Si el vehículo eliminado era el activo, limpiar la selección
      if (activeVehicle?.id === vehicleId) {
        setActiveVehicleState(null);
      }

      // Refrescar la lista de vehículos
      await fetchVehicles();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar el vehículo';
      setError(errorMessage);
      console.error('Error deleting vehicle:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, activeVehicle, fetchVehicles]);

  // Establecer vehículo activo
  const setActiveVehicle = useCallback((vehicle: Vehicle | null) => {
    setActiveVehicleState(vehicle);
  }, []);

  // Refrescar vehículos
  const refreshVehicles = useCallback(async (): Promise<void> => {
    await fetchVehicles();
  }, [fetchVehicles]);

  // Cargar vehículos al montar el componente o cuando cambie el usuario
  useEffect(() => {
    if (supabaseUser) {
      fetchVehicles();
    } else {
      setVehicles([]);
      setActiveVehicleState(null);
      setError(null);
    }
  }, [supabaseUser, fetchVehicles]);

  // Suscribirse a cambios en tiempo real de vehículos
  useEffect(() => {
    if (!supabaseUser) return;

    const subscription = supabase
      .channel('vehicles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: `user_id=eq.${supabaseUser.id}`,
        },
        (payload) => {
          console.log('Vehicle change detected:', payload);
          // Refrescar vehículos cuando hay cambios
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseUser, fetchVehicles]);

  return {
    vehicles,
    activeVehicle,
    isLoading,
    error,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setActiveVehicle,
    refreshVehicles,
  };
}

export type { Vehicle, UseVehiclesReturn };