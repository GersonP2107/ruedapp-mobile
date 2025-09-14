import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { NetworkStatusBanner } from '../components/ui/NetworkStatusBanner';

// Interfaces expandidas
interface Vehicle {
  id: string;
  user_id: string;
  vehicle_type_id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  is_active: boolean;
  vehicle_type: {
    id: string;
    name: string;
    description: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  token: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  
  // Estado de red
  isConnected: boolean;
  showNetworkError: (message: string) => void;
  showNetworkWarning: (message: string) => void;
  showNetworkInfo: (message: string) => void;
  
  // Métodos de autenticación
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  
  // Métodos de Supabase
  signUpWithSupabase: (email: string, password: string, options?: { full_name?: string; phone?: string }) => Promise<{ data: any; error: any }>;
  signInWithSupabase: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOutFromSupabase: () => Promise<{ error: any }>;
  
  // Métodos para datos del usuario
  fetchUserProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  
  // Métodos para vehículos
  fetchUserVehicles: () => Promise<Vehicle[]>;
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'is_active'>) => Promise<boolean>;
  updateVehicle: (vehicleId: string, vehicleData: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  
  // Método helper para llamadas autenticadas
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// NOTA: API legacy desactivada - ahora se usa Supabase para toda la autenticación
// const API_BASE_URL = __DEV__ 
//   ? 'https://api.pereiradev.com'  // API legacy - ya no se usa
//   : 'https://api.pereiradev.com'; // API legacy - ya no se usa

// Supabase maneja toda la autenticación y datos de usuario
// Los métodos legacy se mantienen por compatibilidad pero deberían migrar a Supabase


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  
  // Hook de estado de red
  const {
    isConnected,
    showBanner,
    bannerMessage,
    bannerType,
    hideBanner,
    showNetworkError,
    showNetworkWarning,
    showNetworkInfo,
  } = useNetworkStatus();

  // OBSOLETO: Helper para llamadas autenticadas a API legacy
  // TODO: Migrar a Supabase - este método ya no debería usarse
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    console.warn('⚠️ makeAuthenticatedRequest está obsoleto - usar Supabase en su lugar');
    const token = user?.token || await AsyncStorage.getItem('userToken');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      if (!navigator.onLine) {
        throw new Error('NO_INTERNET');
      }
      throw new Error('NETWORK_ERROR');
    }
  };

  // OBSOLETO: Obtener perfil del usuario desde API legacy
  // TODO: Migrar a Supabase - usar session.user.user_metadata en su lugar
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    console.warn('⚠️ fetchUserProfile está obsoleto - usar datos de Supabase session en su lugar');
    
    // Si hay sesión de Supabase, usar esos datos en lugar de la API legacy
    if (session?.user) {
      const profile: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || '',
        phone: session.user.user_metadata?.phone,
        created_at: session.user.created_at
      };
      setUser(prev => prev ? { ...prev, profile } : null);
      return profile;
    }
    
    // Fallback a API legacy (obsoleto)
    try {
      // const response = await makeAuthenticatedRequest(`${API_BASE_URL}/users/profile`);
      console.warn('API legacy deshabilitada - usando datos de Supabase únicamente');
      return null;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // OBSOLETO: Actualizar perfil del usuario en API legacy
  // TODO: Migrar a Supabase - usar supabase.auth.updateUser() en su lugar
  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    console.warn('⚠️ updateUserProfile está obsoleto - usar supabase.auth.updateUser() en su lugar');
    
    // Usar Supabase para actualizar el perfil
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
          // Otros campos del perfil
        }
      });
      
      if (error) {
        console.error('Error updating user profile with Supabase:', error);
        return false;
      }
      
      // Actualizar el estado local
      if (data.user) {
        const updatedProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone,
          created_at: data.user.created_at
        };
        setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  // OBSOLETO: Obtener vehículos del usuario desde API legacy
  // TODO: Migrar a Supabase - crear tabla 'vehicles' y usar supabase.from('vehicles').select()
  const fetchUserVehicles = async (): Promise<Vehicle[]> => {
    console.warn('⚠️ fetchUserVehicles está obsoleto - migrar a tabla Supabase vehicles');
    
    // TODO: Implementar con Supabase
    // const { data, error } = await supabase
    //   .from('vehicles')
    //   .select('*, vehicle_type(*)')
    //   .eq('user_id', session?.user?.id);
    
    console.warn('API legacy deshabilitada - retornando array vacío');
    return [];
    

  };

  // OBSOLETO: Agregar vehículo usando API legacy
  // TODO: Migrar a Supabase - usar supabase.from('vehicles').insert()
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'is_active'>): Promise<boolean> => {
    console.warn('⚠️ addVehicle está obsoleto - migrar a Supabase');
    return false; // API legacy deshabilitada
  };

  // OBSOLETO: Actualizar vehículo usando API legacy
  // TODO: Migrar a Supabase - usar supabase.from('vehicles').update()
  const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<boolean> => {
    console.warn('⚠️ updateVehicle está obsoleto - migrar a Supabase');
    return false; // API legacy deshabilitada
  };

  // OBSOLETO: Eliminar vehículo usando API legacy
  // TODO: Migrar a Supabase - usar supabase.from('vehicles').delete()
  const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
    console.warn('⚠️ deleteVehicle está obsoleto - migrar a Supabase');
    return false; // API legacy deshabilitada
  };

  // Cargar datos iniciales del usuario
  const loadUserData = async () => {
    if (user) {
      await Promise.all([
        fetchUserProfile(),
        fetchUserVehicles(),
      ]);
    }
  };

  // Actualizar checkAuthStatus para cargar datos
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
        
        // Cargar datos del usuario después de autenticar
        setTimeout(() => loadUserData(), 100);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // OBSOLETO: Función de login usando API legacy
  // TODO: Migrar completamente a Supabase - usar solo signInWithSupabase()
  const login = async (email: string, password: string): Promise<boolean> => {
    console.warn('⚠️ login legacy está obsoleto - usar signInWithSupabase() en su lugar');
    
    // API legacy deshabilitada - usar Supabase
    try {
      const { data, error } = await signInWithSupabase(email, password);
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      if (data.user && data.session) {
        // El estado se actualiza automáticamente por el listener de Supabase
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // OBSOLETO: Función de registro usando API legacy
  // TODO: Migrar completamente a Supabase - usar solo signUpWithSupabase()
  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    console.warn('⚠️ register legacy está obsoleto - usar signUpWithSupabase() en su lugar');
    
    // API legacy deshabilitada - usar Supabase
    try {
      const { data, error } = await signUpWithSupabase(email, password, { full_name: fullName });
      
      if (error) {
        console.error('Register error:', error.message);
        return false;
      }
      
      if (data.user) {
        // El estado se actualiza automáticamente por el listener de Supabase
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      // También cerrar sesión en Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Métodos de Supabase
  const signUpWithSupabase = async (email: string, password: string, options?: { full_name?: string; phone?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: options?.full_name,
          phone: options?.phone,
        },
      },
    });
    return { data, error };
  };

  const signInWithSupabase = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOutFromSupabase = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Configurar listener de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        // Actualizar el estado user para la navegación automática
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email || '',
            token: session.access_token,
            profile: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || '',
              phone: session.user.user_metadata?.phone,
              created_at: session.user.created_at
            }
          };
          setUser(userData);
          setIsLoading(false);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Obtener sesión inicial de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      // Actualizar el estado user para la navegación automática
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email || '',
          token: session.access_token,
          profile: {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone,
            created_at: session.user.created_at
          }
        };
        setUser(userData);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      session,
      isLoading,
      vehicles,
      activeVehicle,
      isConnected,
      showNetworkError,
      showNetworkWarning,
      showNetworkInfo,
      login,
      register,
      logout,
      checkAuthStatus,
      signUpWithSupabase,
      signInWithSupabase,
      signOutFromSupabase,
      fetchUserProfile,
      updateUserProfile,
      fetchUserVehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      setActiveVehicle,
      makeAuthenticatedRequest,
    }}>
      <NetworkStatusBanner
        isVisible={showBanner}
        message={bannerMessage}
        type={bannerType}
        onHide={hideBanner}
      />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}