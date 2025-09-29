import { useAuth } from '../../../infrastructure/context/AuthContext';
import { handleAuthError, logError } from '@/utils/errorHandling';
import { FormErrors, getPasswordStrength, hasFormErrors, validateEmail, validateFullName, validatePassword, validateSignupForm } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingScreen, ValidatedInput } from '../../components';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#e5e7eb' });
  const { register, signUpWithSupabase, isConnected, showNetworkWarning } = useAuth();

  // Función para validar confirmación de contraseña
  const validateConfirmPassword = (confirmPass: string) => {
    if (!confirmPass) {
      return { isValid: false, message: 'La confirmación de contraseña es requerida' };
    }
    if (confirmPass !== password) {
      return { isValid: false, message: 'Las contraseñas no coinciden' };
    }
    return { isValid: true };
  };

  const handleSupabaseSignUp = async () => {
    setHasAttemptedSubmit(true);
    
    // Verificar conectividad
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    
    // Validar formulario incluyendo confirmación de contraseña
    const formErrors = validateSignupForm(fullName, email, password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
    
    if (!confirmPasswordValidation.isValid) {
      formErrors.confirmPassword = confirmPasswordValidation.message;
    }
    
    setErrors(formErrors);
    
    if (hasFormErrors(formErrors)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUpWithSupabase(email.trim(), password, {
        full_name: fullName.trim(),
      });
      
      if (error) {
        const errorResponse = handleAuthError(error);
        Alert.alert(errorResponse.title, errorResponse.message);
      } else {
        // Mostrar pantalla de carga antes del redireccionamiento
        setIsLoading(false);
        setShowLoading(true);
      }
    } catch (error) {
      logError('Signup', error, { email, fullName });
      const errorResponse = handleAuthError(error);
      Alert.alert(errorResponse.title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    router.push('/vehicle-registration');
  };

  const handleLegacySignUp = async () => {
    setHasAttemptedSubmit(true);
    
    // Verificar conectividad
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    
    // Validar formulario incluyendo confirmación de contraseña
    const formErrors = validateSignupForm(fullName, email, password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
    
    if (!confirmPasswordValidation.isValid) {
      formErrors.confirmPassword = confirmPasswordValidation.message;
    }
    
    setErrors(formErrors);
    
    if (hasFormErrors(formErrors)) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await register(fullName.trim(), email.trim(), password);
      if (success) {
        Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a usar RuedApp.');
        // La navegación se maneja automáticamente en el AuthContext
      } else {
        const errorResponse = handleAuthError({ message: 'Registration failed' });
        Alert.alert(errorResponse.title, errorResponse.message);
      }
    } catch (error) {
      logError('Legacy Signup', error, { email, fullName });
      const errorResponse = handleAuthError(error);
      Alert.alert(errorResponse.title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setFullName(value);
    const nameValidation = validateFullName(value);
    setIsNameValid(nameValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        fullName: nameValidation.isValid ? undefined : nameValidation.message
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const emailValidation = validateEmail(value);
    setIsEmailValid(emailValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        email: emailValidation.isValid ? undefined : emailValidation.message
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const strength = getPasswordStrength(value);
    setPasswordStrength(strength);
    
    const passwordValidation = validatePassword(value);
    setIsPasswordValid(passwordValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        password: passwordValidation.isValid ? undefined : passwordValidation.message
      }));
      
      // Re-validar confirmación de contraseña si ya se ingresó
      if (confirmPassword) {
        const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
        setIsConfirmPasswordValid(confirmPasswordValidation.isValid);
        setErrors(prev => ({
          ...prev,
          confirmPassword: confirmPasswordValidation.isValid ? undefined : confirmPasswordValidation.message
        }));
      }
    } else {
      // También validar confirmación de contraseña en tiempo real si ya se ingresó
      if (confirmPassword) {
        const confirmPasswordValidation = validateConfirmPassword(confirmPassword);
        setIsConfirmPasswordValid(confirmPasswordValidation.isValid);
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const confirmPasswordValidation = validateConfirmPassword(value);
    setIsConfirmPasswordValid(confirmPasswordValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordValidation.isValid ? undefined : confirmPasswordValidation.message
      }));
    }
  };

  const isFormValid = isEmailValid && isNameValid && isPasswordValid && isConfirmPasswordValid;

  if (showLoading) {
    return (
      <LoadingScreen
        title="¡Registro exitoso!"
        subtitle="Preparando el registro de tu primer vehículo..."
        duration={2500}
        onComplete={handleLoadingComplete}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="car-sport" size={32} color="#ffffff" />
              </View>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Registrarse</Text>
              <Text style={styles.subtitle}>
                Bienvenido a RuedApp, vamos a crear tu cuenta ahora
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ValidatedInput
                label="Nombre completo"
                placeholder="Ingresa tu nombre y apellido"
                value={fullName}
                onChangeText={handleNameChange}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
                leftIcon="person-outline"
                error={errors.fullName}
                validator={validateFullName}
                onValidationChange={setIsNameValid}
                showValidation={hasAttemptedSubmit}
              />

              <ValidatedInput
                label="Correo electrónico"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
                leftIcon="mail-outline"
                error={errors.email}
                validator={validateEmail}
                onValidationChange={setIsEmailValid}
                showValidation={hasAttemptedSubmit}
              />

              <ValidatedInput
                label="Contraseña"
                placeholder="Crea una contraseña segura"
                value={password}
                onChangeText={handlePasswordChange}
                editable={!isLoading}
                leftIcon="lock-closed-outline"
                showPasswordToggle
                error={errors.password}
                validator={validatePassword}
                onValidationChange={setIsPasswordValid}
                showValidation={hasAttemptedSubmit}
                strengthIndicator
                strengthScore={passwordStrength.score}
                strengthLabel={passwordStrength.label}
                strengthColor={passwordStrength.color}
              />

              <ValidatedInput
                label="Confirmar contraseña"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                editable={!isLoading}
                leftIcon="lock-closed-outline"
                showPasswordToggle
                error={errors.confirmPassword}
                validator={validateConfirmPassword}
                onValidationChange={setIsConfirmPasswordValid}
                showValidation={hasAttemptedSubmit}
              />

              <TouchableOpacity 
                style={[
                  styles.createAccountButton,
                  (isLoading || !isFormValid) && styles.createAccountButtonDisabled
                ]}
                onPress={handleSupabaseSignUp}
                disabled={isLoading || !isFormValid}
                accessible={true}
                accessibilityLabel="Crear cuenta"
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoading || !isFormValid,
                  busy: isLoading
                }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.loadingText}>Creando cuenta...</Text>
                  </View>
                ) : (
                  <Text style={styles.createAccountButtonText}>Registrarse</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/login')} 
                  disabled={isLoading}
                  accessible={true}
                  accessibilityLabel="Iniciar sesión"
                  accessibilityRole="button"
                  accessibilityHint="Navega a la página de inicio de sesión"
                >
                  <Text style={styles.loginLink}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#44F1A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#44F1A6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  createAccountButton: {
    backgroundColor: '#44F1A6',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#44F1A6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createAccountButtonDisabled: {
    opacity: 0.6,
  },
  createAccountButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  loginText: {
    color: '#666666',
    fontSize: 16,
  },
  loginLink: {
    color: '#44F1A6',
    fontSize: 16,
    fontWeight: '600',
  },
});