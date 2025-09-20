import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Interfaces
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  created_at: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<UserProfile | null>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { supabaseUser, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener perfil del usuario
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!supabaseUser || !session) {
      setProfile(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Crear perfil desde los datos de Supabase Auth
      const userProfile: UserProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: supabaseUser.user_metadata?.full_name || '',
        phone: supabaseUser.user_metadata?.phone,
        address: supabaseUser.user_metadata?.address,
        city: supabaseUser.user_metadata?.city,
        created_at: supabaseUser.created_at
      };

      setProfile(userProfile);
      return userProfile;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener el perfil';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, session]);

  // Actualizar perfil del usuario
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!supabaseUser) {
      setError('Usuario no autenticado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Actualizar datos en Supabase Auth
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
        }
      });

      if (updateError) {
        throw updateError;
      }

      if (data.user) {
        // Actualizar el estado local
        const updatedProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone,
          address: data.user.user_metadata?.address,
          city: data.user.user_metadata?.city,
          created_at: data.user.created_at
        };
        setProfile(updatedProfile);
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el perfil';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser]);

  // Refrescar perfil
  const refreshProfile = useCallback(async (): Promise<void> => {
    await fetchProfile();
  }, [fetchProfile]);

  // Cargar perfil al montar el componente o cuando cambie el usuario
  useEffect(() => {
    if (supabaseUser) {
      fetchProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [supabaseUser, fetchProfile]);

  // Suscribirse a cambios en tiempo real del usuario
  useEffect(() => {
    if (!supabaseUser) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'USER_UPDATED' && session?.user) {
          // Actualizar perfil cuando el usuario se actualice
          const updatedProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone,
            address: session.user.user_metadata?.address,
            city: session.user.user_metadata?.city,
            created_at: session.user.created_at
          };
          setProfile(updatedProfile);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseUser]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    refreshProfile,
  };
}

export type { UserProfile, UseProfileReturn };