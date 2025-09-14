import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Configuración condicional para evitar errores de SSR
const getAuthConfig = () => {
  // Solo usar AsyncStorage en el cliente, no en el servidor
  if (typeof window === 'undefined') {
    return {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    };
  }
  
  return {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: getAuthConfig(),
});

// Helper functions for common operations
export const auth = supabase.auth;
export const db = supabase;

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};