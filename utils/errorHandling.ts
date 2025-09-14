// Utilidades para manejo de errores de autenticación y Supabase

import { AuthError } from '@supabase/supabase-js';

export interface ErrorResponse {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

// Mapeo de errores de Supabase
export const mapSupabaseError = (error: AuthError | any): ErrorResponse => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.status || error?.code;

  // Errores de autenticación específicos
  if (errorMessage.includes('invalid login credentials') || 
      errorMessage.includes('invalid email or password')) {
    return {
      title: 'Credenciales incorrectas',
      message: 'El correo electrónico o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.',
      type: 'error'
    };
  }

  if (errorMessage.includes('email not confirmed')) {
    return {
      title: 'Email no confirmado',
      message: 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
      type: 'warning'
    };
  }

  if (errorMessage.includes('user already registered') || 
      errorMessage.includes('email already exists')) {
    return {
      title: 'Usuario ya existe',
      message: 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión o usa otro email.',
      type: 'warning'
    };
  }

  if (errorMessage.includes('password is too weak') || 
      errorMessage.includes('weak password')) {
    return {
      title: 'Contraseña débil',
      message: 'La contraseña debe tener al menos 8 caracteres e incluir letras y números.',
      type: 'warning'
    };
  }

  if (errorMessage.includes('invalid email')) {
    return {
      title: 'Email inválido',
      message: 'El formato del correo electrónico no es válido. Verifica e intenta nuevamente.',
      type: 'error'
    };
  }

  if (errorMessage.includes('too many requests') || 
      errorMessage.includes('rate limit')) {
    return {
      title: 'Demasiados intentos',
      message: 'Has realizado demasiados intentos. Espera unos minutos antes de intentar nuevamente.',
      type: 'warning'
    };
  }

  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') ||
      errorCode === 'NETWORK_ERROR') {
    return {
      title: 'Error de conexión',
      message: 'Verifica tu conexión a internet e intenta nuevamente.',
      type: 'error'
    };
  }

  if (errorMessage.includes('timeout')) {
    return {
      title: 'Tiempo agotado',
      message: 'La operación tardó demasiado tiempo. Verifica tu conexión e intenta nuevamente.',
      type: 'error'
    };
  }

  // Errores de servidor
  if (errorCode >= 500) {
    return {
      title: 'Error del servidor',
      message: 'Estamos experimentando problemas técnicos. Intenta nuevamente en unos minutos.',
      type: 'error'
    };
  }

  // Error genérico
  return {
    title: 'Error inesperado',
    message: 'Ocurrió un error inesperado. Si el problema persiste, contacta al soporte.',
    type: 'error'
  };
};

// Mapeo de errores de la API personalizada
export const mapApiError = (response: Response, data?: any): ErrorResponse => {
  const status = response.status;
  const errorMessage = data?.message?.toLowerCase() || data?.error?.toLowerCase() || '';

  switch (status) {
    case 400:
      if (errorMessage.includes('email already exists')) {
        return {
          title: 'Email ya registrado',
          message: 'Ya existe una cuenta con este correo electrónico.',
          type: 'warning'
        };
      }
      return {
        title: 'Datos inválidos',
        message: 'Los datos proporcionados no son válidos. Verifica la información e intenta nuevamente.',
        type: 'error'
      };

    case 401:
      return {
        title: 'Credenciales incorrectas',
        message: 'El correo electrónico o la contraseña son incorrectos.',
        type: 'error'
      };

    case 403:
      return {
        title: 'Acceso denegado',
        message: 'No tienes permisos para realizar esta acción.',
        type: 'error'
      };

    case 404:
      return {
        title: 'Usuario no encontrado',
        message: 'No se encontró una cuenta con este correo electrónico.',
        type: 'error'
      };

    case 422:
      return {
        title: 'Datos inválidos',
        message: data?.message || 'Los datos proporcionados no cumplen con los requisitos.',
        type: 'warning'
      };

    case 429:
      return {
        title: 'Demasiados intentos',
        message: 'Has realizado demasiados intentos. Espera unos minutos antes de intentar nuevamente.',
        type: 'warning'
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        title: 'Error del servidor',
        message: 'Estamos experimentando problemas técnicos. Intenta nuevamente en unos minutos.',
        type: 'error'
      };

    default:
      return {
        title: 'Error inesperado',
        message: 'Ocurrió un error inesperado. Si el problema persiste, contacta al soporte.',
        type: 'error'
      };
  }
};

// Manejo de errores de red
export const mapNetworkError = (error: any): ErrorResponse => {
  if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
    return {
      title: 'Sin conexión',
      message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      type: 'error'
    };
  }

  if (error.name === 'AbortError') {
    return {
      title: 'Operación cancelada',
      message: 'La operación fue cancelada. Intenta nuevamente.',
      type: 'warning'
    };
  }

  return {
    title: 'Error de conexión',
    message: 'Verifica tu conexión a internet e intenta nuevamente.',
    type: 'error'
  };
};

// Manejo específico de errores de conectividad
export const handleNetworkError = (error: any): string => {
  if (!error) return 'Error de conexión desconocido';
  
  // Errores de conectividad específicos
  if (error.message === 'NO_INTERNET') {
    return 'Sin conexión a internet. Verifica tu conexión y vuelve a intentar.';
  }
  
  if (error.message === 'TIMEOUT') {
    return 'La conexión tardó demasiado. Vuelve a intentar.';
  }
  
  if (error.message === 'NETWORK_ERROR') {
    return 'Error de red. Verifica tu conexión a internet.';
  }
  
  // Errores de red comunes (fallback)
  if (error.message?.includes('Network request failed')) {
    return 'Sin conexión a internet. Verifica tu conexión y vuelve a intentar.';
  }
  
  if (error.message?.includes('timeout')) {
    return 'La conexión tardó demasiado. Vuelve a intentar.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Error de red. Verifica tu conexión a internet.';
  }
  
  return 'Error de conexión. Verifica tu conexión a internet.';
};

// Función principal para manejar cualquier tipo de error
export const handleAuthError = (error: any, response?: Response): ErrorResponse => {
  // Log del error para debugging
  logError('Auth error occurred', error);
  
  // Errores de conectividad específicos
  if (error?.message === 'NO_INTERNET' || error?.message === 'TIMEOUT' || error?.message === 'NETWORK_ERROR') {
    const networkError = handleNetworkError(error);
    return {
      title: 'Error de conexión',
      message: networkError,
      type: 'error'
    };
  }
  
  // Error de Supabase
  if (error?.message && (error.status || error.code)) {
    return mapSupabaseError(error);
  }

  // Error de respuesta HTTP
  if (response && !response.ok) {
    return mapApiError(response, error);
  }

  // Errores de red genéricos
  if (error instanceof TypeError || error.name === 'NetworkError') {
    return mapNetworkError(error);
  }

  // Error genérico
  return {
    title: 'Error inesperado',
    message: error?.message || 'Ocurrió un error inesperado. Intenta nuevamente.',
    type: 'error'
  };
};

// Utilidad para logging de errores (para debugging)
export const logError = (context: string, error: any, additionalData?: any) => {
  if (__DEV__) {
    console.group(`🚨 Error en ${context}`);
    console.error('Error:', error);
    if (additionalData) {
      console.log('Datos adicionales:', additionalData);
    }
    console.groupEnd();
  }
};