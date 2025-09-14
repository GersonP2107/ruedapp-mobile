// Utilidades de validación para formularios de autenticación

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  general?: string;
}

// Validación de email
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'El correo electrónico es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Ingresa un correo electrónico válido' };
  }

  // Validaciones adicionales
  if (email.length > 254) {
    return { isValid: false, message: 'El correo electrónico es demasiado largo' };
  }

  return { isValid: true };
};

// Validación de contraseña
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'La contraseña es demasiado larga' };
  }

  // Verificar que contenga al menos una letra y un número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra y un número' };
  }

  return { isValid: true };
};

// Validación de nombre completo
export const validateFullName = (fullName: string): ValidationResult => {
  if (!fullName.trim()) {
    return { isValid: false, message: 'El nombre completo es requerido' };
  }

  if (fullName.trim().length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (fullName.length > 100) {
    return { isValid: false, message: 'El nombre es demasiado largo' };
  }

  // Verificar que contenga al menos dos palabras
  const words = fullName.trim().split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, message: 'Ingresa tu nombre y apellido' };
  }

  // Verificar que solo contenga letras, espacios y algunos caracteres especiales
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(fullName)) {
    return { isValid: false, message: 'El nombre solo puede contener letras y espacios' };
  }

  return { isValid: true };
};

// Evaluación de fortaleza de contraseña
export const getPasswordStrength = (password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} => {
  if (!password) {
    return { score: 0, label: '', color: '#e5e7eb' };
  }

  let score = 0;
  
  // Longitud
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Complejidad
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^\w\s]/.test(password)) score++;
  
  // Normalizar a escala 0-4
  const normalizedScore = Math.min(4, Math.floor(score / 1.5));
  
  const strengthMap = {
    0: { label: 'Muy débil', color: '#ef4444' },
    1: { label: 'Débil', color: '#f97316' },
    2: { label: 'Regular', color: '#eab308' },
    3: { label: 'Fuerte', color: '#22c55e' },
    4: { label: 'Muy fuerte', color: '#16a34a' },
  };
  
  return {
    score: normalizedScore,
    ...strengthMap[normalizedScore as keyof typeof strengthMap]
  };
};

// Validación completa del formulario de login
export const validateLoginForm = (email: string, password: string): FormErrors => {
  const errors: FormErrors = {};
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  if (!password) {
    errors.password = 'La contraseña es requerida';
  }
  
  return errors;
};

// Validación completa del formulario de registro
export const validateSignupForm = (fullName: string, email: string, password: string): FormErrors => {
  const errors: FormErrors = {};
  
  const nameValidation = validateFullName(fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.message;
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  return errors;
};

// Sanitización de entrada
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// Verificar si hay errores en el formulario
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};