import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Tipos para la configuración de autenticación
export interface AuthConfig {
  redirectTo?: string;
  emailRedirectTo?: string;
  captchaToken?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
      phone?: string;
      avatar_url?: string;
    };
    emailRedirectTo?: string;
    captchaToken?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
  options?: {
    captchaToken?: string;
  };
}

export interface ResetPasswordData {
  email: string;
  options?: {
    redirectTo?: string;
    captchaToken?: string;
  };
}

export interface UpdatePasswordData {
  password: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  data?: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };
}

// Configuración de autenticación para RuedApp
export const authConfig = {
  // URL de redirección después del login
  redirectTo: 'ruedapp://auth/callback',
  
  // URL de redirección para confirmación de email
  emailRedirectTo: 'ruedapp://auth/confirm',
  
  // Configuración de sesión
  session: {
    // Tiempo de expiración de la sesión (en segundos)
    expiresIn: 3600, // 1 hora
    
    // Renovación automática de token
    autoRefreshToken: true,
    
    // Persistir sesión
    persistSession: true,
  },
  
  // Configuración de validación
  validation: {
    // Longitud mínima de contraseña
    minPasswordLength: 8,
    
    // Requerir mayúsculas
    requireUppercase: true,
    
    // Requerir números
    requireNumbers: true,
    
    // Requerir caracteres especiales
    requireSpecialChars: false,
  },
  
  // Configuración de proveedores OAuth (para futuras implementaciones)
  providers: {
    google: {
      enabled: false,
      scopes: 'email profile',
    },
    facebook: {
      enabled: false,
      scopes: 'email',
    },
    apple: {
      enabled: false,
    },
  },
};

// Funciones de utilidad para autenticación
export class SupabaseAuthService {
  /**
   * Registrar nuevo usuario
   */
  static async signUp(data: SignUpData) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          ...data.options,
          emailRedirectTo: data.options?.emailRedirectTo || authConfig.emailRedirectTo,
        },
      });

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data: authData };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * Iniciar sesión
   */
  static async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data: authData };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * Cerrar sesión
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Restablecer contraseña
   */
  static async resetPassword(data: ResetPasswordData) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: data.options?.redirectTo || authConfig.redirectTo,
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar contraseña
   */
  static async updatePassword(data: UpdatePasswordData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar datos del usuario
   */
  static async updateUser(data: UpdateUserData) {
    try {
      const { data: userData, error } = await supabase.auth.updateUser(data);

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data: userData };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * Obtener sesión actual
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { success: false, error: error.message, session: null };
      }

      return { success: true, error: null, session };
    } catch (error: any) {
      return { success: false, error: error.message, session: null };
    }
  }

  /**
   * Obtener usuario actual
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return { success: false, error: error.message, user: null };
      }

      return { success: true, error: null, user };
    } catch (error: any) {
      return { success: false, error: error.message, user: null };
    }
  }

  /**
   * Validar contraseña según configuración
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = authConfig.validation;

    if (password.length < config.minPasswordLength) {
      errors.push(`La contraseña debe tener al menos ${config.minPasswordLength} caracteres`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Escuchar cambios de autenticación
   */
  static onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getCurrentSession();
    return !!session;
  }

  /**
   * Obtener token de acceso
   */
  static async getAccessToken(): Promise<string | null> {
    const { session } = await this.getCurrentSession();
    return session?.access_token || null;
  }

  /**
   * Refrescar token
   */
  static async refreshToken() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { success: false, error: error.message, session: null };
      }

      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      return { success: false, error: error.message, session: null };
    }
  }
}

// Exportar instancia por defecto
export default SupabaseAuthService;

// Tipos de eventos de autenticación
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

// Interface para el estado de autenticación
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

// Constantes de errores comunes
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid login credentials',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_CONFIRMED: 'Email not confirmed',
  WEAK_PASSWORD: 'Password should be at least 6 characters',
  EMAIL_ALREADY_REGISTERED: 'User already registered',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

// Función para mapear errores de Supabase a mensajes en español
export const mapAuthError = (error: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Credenciales de acceso inválidas',
    'User not found': 'Usuario no encontrado',
    'Email not confirmed': 'Email no confirmado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'User already registered': 'El usuario ya está registrado',
    'Network error occurred': 'Error de conexión',
    'Email rate limit exceeded': 'Límite de envío de emails excedido',
    'Signup is disabled': 'El registro está deshabilitado',
  };

  return errorMap[error] || 'Ha ocurrido un error inesperado';
};