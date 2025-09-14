import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Hook para gestionar vehículos con Supabase
export const useVehicles = () => {
  const { supabaseUser } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    if (!supabaseUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_type:vehicle_types(*)
        `)
        .eq('user_id', supabaseUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: any) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          user_id: supabaseUser.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchVehicles(); // Refrescar lista
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (vehicleId: string, updates: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .eq('user_id', supabaseUser?.id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchVehicles(); // Refrescar lista
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', vehicleId)
        .eq('user_id', supabaseUser?.id);

      if (error) throw error;
      
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

// Hook para gestionar tipos de vehículos
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

// Hook para gestionar servicios
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

// Hook para gestionar proveedores
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

// Hook para gestionar solicitudes de servicio
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
      
      await fetchUserRequests(); // Refrescar lista
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
      
      await fetchUserRequests(); // Refrescar lista
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

// Hook para gestionar perfil de usuario
export const useProfile = () => {
  const { supabaseUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!supabaseUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        // Si no existe el perfil, crear uno nuevo
        if (error.code === 'PGRST116') {
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            full_name: supabaseUser.user_metadata?.full_name || '',
            phone: supabaseUser.user_metadata?.phone || '',
            address: '',
            city: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('user_profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (insertError) throw insertError;
          setProfile(insertData);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
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
      fetchProfile();
      
      // Configurar suscripción en tiempo real para cambios en el perfil
      const subscription = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `id=eq.${supabaseUser.id}`
          },
          (payload) => {
            console.log('Profile updated in real-time:', payload);
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setProfile(payload.new);
            } else if (payload.eventType === 'DELETE') {
              setProfile(null);
            }
          }
        )
        .subscribe();

      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabaseUser]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};