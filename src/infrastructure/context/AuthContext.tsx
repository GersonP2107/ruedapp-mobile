import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { supabase } from '../../../lib/supabase';
import { NetworkStatusBanner } from '../../presentation/components/ui/NetworkStatusBanner';
import { RuntValidationService, VehicleValidationResult } from '../services/RuntValidationService';

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

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  created_at: string;
  document_type?: string; 
  document_number?: string;
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
  
  // Nuevo método para enviar OTP solo para Login
  sendOtpLogin: (email: string) => Promise<{ data: any; error: any }>;

  // Métodos de autenticación
  login: (email: string) => Promise<boolean>;
  register: (fullName: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  
  // Métodos de Supabase
  signUpWithSupabase: (email: string, options?: { full_name?: string; phone?: string }) => Promise<{ data: any; error: any }>;
  signInWithSupabase: (email: string ) => Promise<{ data: any; error: any }>;
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
  
  // Nuevo método para registro de vehículo con validación automática
  addVehicleWithValidation: (licensePlate: string) => Promise<{
    success: boolean;
    error?: string;
    validationResult?: VehicleValidationResult;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // Helper para llamadas autenticadas (obsoleto - usar Supabase)
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    console.warn('⚠️ makeAuthenticatedRequest está obsoleto - usar Supabase en su lugar');
    const token = user?.token || await AsyncStorage.getItem('userToken');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
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

  // Función de logout
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setVehicles([]);
      setActiveVehicle(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Obtener perfil del usuario desde Supabase
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    if (session?.user) {
      const profile: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || '',
        phone: session.user.user_metadata?.phone,
        created_at: session.user.created_at,
        document_type: session.user.user_metadata?.document_type,
        document_number: session.user.user_metadata?.document_number,
      };
      setUser(prev => prev ? { ...prev, profile } : null);
      return profile;
    }
    return null;
  };

  // Actualizar perfil del usuario en Supabase
  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
          document_type: profileData.document_type,
          document_number: profileData.document_number,
        }
      });
      
      if (error) {
        console.error('Error updating user profile with Supabase:', error);
        return false;
      }
      
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

  // Obtener vehículos del usuario
  const fetchUserVehicles = async (): Promise<Vehicle[]> => {
    if (!supabaseUser) return [];
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const vehicleList = data || [];
      setVehicles(vehicleList);
      return vehicleList;
    } catch (error) {
      console.error('Error fetching user vehicles:', error);
      return [];
    }
  };

  // Agregar vehículo
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'is_active'>): Promise<boolean> => {
    if (!supabaseUser) return false;
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleData,
          user_id: supabaseUser.id,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchUserVehicles();
      return true;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return false;
    }
  };

  // Actualizar vehículo
  const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<boolean> => {
    if (!supabaseUser) return false;
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', vehicleId)
        .eq('user_id', supabaseUser.id);

      if (error) throw error;
      
      await fetchUserVehicles();
      return true;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return false;
    }
  };

  // Eliminar vehículo (soft delete)
  const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
    if (!supabaseUser) return false;
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', vehicleId)
        .eq('user_id', supabaseUser.id);

      if (error) throw error;
      
      await fetchUserVehicles();
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
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

  // Verificar estado de autenticación
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
        setTimeout(() => loadUserData(), 100);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login legacy (usar signInWithSupabase)
  const login = async (email: string): Promise<boolean> => {
    console.warn('⚠️ login legacy está obsoleto - usar signInWithSupabase() en su lugar');
    
    try {
      const { data, error } = await signInWithSupabase(email);
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      if (data.user && data.session) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Register legacy (usar signUpWithSupabase)
  const register = async (fullName: string, email: string): Promise<boolean> => {
    console.warn('⚠️ register legacy está obsoleto - usar signUpWithSupabase() en su lugar');
    
    try {
      const { data, error } = await signUpWithSupabase(email, { full_name: fullName });
      
      if (error) {
        console.error('Register error:', error.message);
        return false;
      }
      
      if (data.user) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  // Métodos de Supabase
  const signUpWithSupabase = async (email: string, options?: { full_name?: string; phone?: string }) => {
      const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
              shouldCreateUser: true,
              data: { full_name: options?.full_name },
          },
      });
      return { data, error };
  };
  
  const signInWithSupabase = async (email: string) => {
      const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {},
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
              created_at: session.user.created_at,
              document_type: session.user.user_metadata?.document_type,
              document_number: session.user.user_metadata?.document_number,
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

  // Nuevo método para agregar vehículo con validación automática del RUNT
  const addVehicleWithValidation = async (licensePlate: string): Promise<{
    success: boolean;
    error?: string;
    validationResult?: VehicleValidationResult;
  }> => {
    if (!supabaseUser) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      // Obtener perfil del usuario para extraer documento
      const profile = await fetchUserProfile();
      if (!profile) {
        return { success: false, error: 'No se pudo obtener el perfil del usuario' };
      }

      // Extraer información del documento (necesitarás agregar estos campos al perfil)
      const userDocument = RuntValidationService.extractDocumentFromProfile(profile);
      if (!userDocument) {
        return { 
          success: false, 
          error: 'Información de documento incompleta. Complete su perfil primero.' 
        };
      }

      // Validar vehículo con el RUNT
      const validationResult = await RuntValidationService.validateVehicleOwnership(
        licensePlate,
        userDocument
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
          validationResult
        };
      }

      // Si la validación es exitosa, registrar el vehículo automáticamente
      const vehicleData = validationResult.vehicleData!;
      
      // Obtener ID del tipo de vehículo
      const vehicleTypeId = await RuntValidationService.getVehicleTypeId(vehicleData.vehicleType);
      if (!vehicleTypeId) {
        return { success: false, error: 'Tipo de vehículo no válido' };
      }

      // Crear el vehículo en la base de datos
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          user_id: supabaseUser.id,
          vehicle_type_id: vehicleTypeId,
          license_plate: licensePlate.toUpperCase(),
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
          color: vehicleData.color,
          mileage: 0, // Valor por defecto
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista de vehículos
      await fetchUserVehicles();

      return {
        success: true,
        validationResult
      };
    
    } catch (error: any) {
      console.error('Error en addVehicleWithValidation:', error);
      return {
        success: false,
        error: 'Error del sistema. Intente nuevamente.'
      };
    }
  };

  const sendOtpLogin = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, 
      },
    });
    return { data, error };
};

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
      sendOtpLogin,
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
      addVehicleWithValidation,
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

export type { AuthContextType, User, UserProfile, Vehicle };

