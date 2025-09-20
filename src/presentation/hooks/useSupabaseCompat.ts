import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../infrastructure/context/AuthContext';
import { useUserManagement } from './useUserManagement';
import { useVehicleManagement } from './useVehicleManagement';

// Hook de compatibilidad para mantener la misma interfaz que useVehicles
export const useVehicles = () => {
  const vehicleHook = useVehicleManagement();
  
  // Mapear la interfaz para mantener compatibilidad
  return {
    vehicles: vehicleHook.vehicles.map(vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.licensePlate,
      user_id: vehicle.userId,
      vehicle_type_id: vehicle.vehicleTypeId,
      is_active: vehicle.isActive,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
      // Mantener compatibilidad con la estructura anterior
      plate: vehicle.licensePlate,
      color: '', // Campo que no existe en la nueva entidad
      isActive: vehicle.isActive
    })),
    loading: vehicleHook.loading,
    error: vehicleHook.error,
    fetchVehicles: vehicleHook.fetchVehicles,
    addVehicle: async (vehicleData: any) => {
      // Mapear datos del formato anterior al nuevo
      const mappedData = {
        brand: vehicleData.brand || '',
        model: vehicleData.model || '',
        year: vehicleData.year || new Date().getFullYear(),
        licensePlate: vehicleData.license_plate || vehicleData.plate || '',
        mileage: vehicleData.mileage || 0,
        vehicleTypeId: vehicleData.vehicle_type_id || ''
      };
      return vehicleHook.addVehicle(mappedData);
    },
    updateVehicle: async (vehicleId: string, updates: any) => {
      // Mapear actualizaciones del formato anterior al nuevo
      const mappedUpdates: any = {};
      if (updates.brand) mappedUpdates.brand = updates.brand;
      if (updates.model) mappedUpdates.model = updates.model;
      if (updates.year) mappedUpdates.year = updates.year;
      if (updates.license_plate || updates.plate) {
        mappedUpdates.licensePlate = updates.license_plate || updates.plate;
      }
      if (updates.mileage) mappedUpdates.mileage = updates.mileage;
      if (updates.vehicle_type_id) mappedUpdates.vehicleTypeId = updates.vehicle_type_id;
      
      return vehicleHook.updateVehicle(vehicleId, mappedUpdates);
    },
    deleteVehicle: async (vehicleId: string) => {
      const result = await vehicleHook.deleteVehicle(vehicleId);
      return {
        success: result,
        error: result ? null : 'Error al eliminar vehículo'
      };
    }
  };
};

// Hook de compatibilidad para mantener la misma interfaz que useProfile
export const useProfile = () => {
  const userHook = useUserManagement();
  
  return {
    profile: userHook.profile ? {
      id: userHook.profile.id,
      email: userHook.profile.email,
      full_name: userHook.profile.fullName,
      phone: userHook.profile.phone,
      address: userHook.profile.address,
      city: userHook.profile.city,
      created_at: userHook.profile.createdAt,
      updated_at: userHook.profile.updatedAt
    } : null,
    loading: userHook.loading,
    error: userHook.error,
    fetchProfile: userHook.fetchProfile,
    updateProfile: async (updates: any) => {
      // Mapear actualizaciones del formato anterior al nuevo
      const mappedUpdates: any = {};
      if (updates.full_name) mappedUpdates.fullName = updates.full_name;
      if (updates.phone) mappedUpdates.phone = updates.phone;
      if (updates.address) mappedUpdates.address = updates.address;
      if (updates.city) mappedUpdates.city = updates.city;
      
      return await userHook.updateProfile(mappedUpdates);
    }
  };
};

// Hook para tipos de vehículos (mantiene implementación original)
export const useVehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleTypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setVehicleTypes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  return {
    vehicleTypes,
    loading,
    error,
    fetchVehicleTypes
  };
};

// Hook para servicios (mantiene implementación original por ahora)
export const useServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPopularServices = async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .rpc('get_popular_services', { limit_count: limit });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    fetchServices,
    getPopularServices
  };
};

// Hook para proveedores (mantiene implementación original)
export const useProviders = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNearbyProviders = async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    serviceId?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_providers', {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: radiusKm,
          service_filter: serviceId || null
        });

      if (error) throw error;
      setProviders(data || []);
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  const getProviderDetails = async (providerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          provider_services(
            *,
            service:services(*)
          )
        `)
        .eq('id', providerId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message, data: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    providers,
    loading,
    error,
    searchNearbyProviders,
    getProviderDetails
  };
};

// Hook para solicitudes de servicio (mantiene implementación original)
export const useServiceRequests = () => {
  const { supabaseUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRequests = async () => {
    if (!supabaseUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_request_history', {
          user_uuid: supabaseUser.id,
          limit_count: 50,
          offset_count: 0
        });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createServiceRequest = async (requestData: any) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          ...requestData,
          user_id: supabaseUser.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchUserRequests();
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', requestId)
        .eq('user_id', supabaseUser?.id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchUserRequests();
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabaseUser) {
      fetchUserRequests();
    }
  }, [supabaseUser]);

  return {
    requests,
    loading,
    error,
    fetchUserRequests,
    createServiceRequest,
    updateRequestStatus
  };
};

// Hook para reseñas (mantiene implementación original)
export const useReviews = () => {
  const { supabaseUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviderReviews = async (providerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implementar cuando se cree la tabla de reviews
      console.log('Fetching reviews for provider:', providerId);
      setReviews([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: any) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implementar cuando se cree la tabla de reviews
      console.log('Creating review:', reviewData);
      return { success: true, data: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    fetchProviderReviews,
    createReview
  };
};