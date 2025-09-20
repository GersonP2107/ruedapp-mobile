import { useAuth } from '../../../infrastructure/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
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
import { ValidatedInput, ForgotPasswordModal } from '../../components';
import { validateLoginForm, validateEmail, hasFormErrors, FormErrors } from '@/utils/validation';
import { handleAuthError, logError } from '@/utils/errorHandling';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { login, signInWithSupabase, isConnected, showNetworkWarning } = useAuth();

  const handleSupabaseLogin = async () => {
    setHasAttemptedSubmit(true);
    
    // Verificar conectividad
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    
    // Validar formulario
    const formErrors = validateLoginForm(email, password);
    setErrors(formErrors);
    
    if (hasFormErrors(formErrors)) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signInWithSupabase(email.trim(), password);
      if (error) {
        const errorResponse = handleAuthError(error);
        Alert.alert(errorResponse.title, errorResponse.message);
      } else {
        // La navegación se maneja automáticamente en el AuthContext
        console.log('Login exitoso con Supabase');
      }
    } catch (error) {
      logError('Supabase Login', error, { email });
      const errorResponse = handleAuthError(error);
      Alert.alert(errorResponse.title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegacyLogin = async () => {
    setHasAttemptedSubmit(true);
    
    // Verificar conectividad
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    
    // Validar formulario
    const formErrors = validateLoginForm(email, password);
    setErrors(formErrors);
    
    if (hasFormErrors(formErrors)) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        // La navegación se maneja automáticamente en el AuthContext
        console.log('Login exitoso con sistema anterior');
      } else {
        // El error específico se maneja en el AuthContext
        const errorResponse = handleAuthError({ message: 'Invalid credentials' });
        Alert.alert(errorResponse.title, errorResponse.message);
      }
    } catch (error) {
      logError('Legacy Login', error, { email });
      const errorResponse = handleAuthError(error);
      Alert.alert(errorResponse.title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (hasAttemptedSubmit) {
      const emailValidation = validateEmail(value);
      setErrors(prev => ({
        ...prev,
        email: emailValidation.isValid ? undefined : emailValidation.message
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        password: value ? undefined : 'La contraseña es requerida'
      }));
    }
  };

  const isFormValid = isEmailValid && password.length > 0 && !hasFormErrors(errors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../../../assets/images/react-logo.png')}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <View style={styles.overlay}>
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
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Iniciar sesión</Text>
                  <Text style={styles.subtitle}>
                    Bienvenido de vuelta a RuedApp, es hora de gestionar tu vehículo
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChangeText={handlePasswordChange}
                    editable={!isLoading}
                    leftIcon="lock-closed-outline"
                    showPasswordToggle
                    error={errors.password}
                    showValidation={hasAttemptedSubmit}
                  />

                  <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={() => setShowForgotPasswordModal(true)}
                    accessible={true}
                    accessibilityLabel="¿Olvidaste tu contraseña?"
                    accessibilityRole="button"
                    accessibilityHint="Abre el formulario para recuperar tu contraseña"
                  >
                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.loginButton,
                      (isLoading || (!isFormValid && hasAttemptedSubmit)) && styles.loginButtonDisabled
                    ]}
                    onPress={handleSupabaseLogin}
                    disabled={isLoading || (!isFormValid && hasAttemptedSubmit)}
                    accessible={true}
                    accessibilityLabel="Iniciar sesión con Supabase"
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: isLoading || (!isFormValid && hasAttemptedSubmit),
                      busy: isLoading
                    }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#ffffff" size="small" />
                        <Text style={styles.loadingText}>Iniciando sesión...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Iniciar sesión con Supabase</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>¿No tienes cuenta? </Text>
                    <TouchableOpacity 
                      onPress={() => router.push('/signup')} 
                      disabled={isLoading}
                      accessible={true}
                      accessibilityLabel="Crear nueva cuenta"
                      accessibilityRole="button"
                      accessibilityHint="Navega a la página de registro"
                    >
                      <Text style={styles.signUpLink}>Registrarse</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
      
      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  signUpLink: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  legacyButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  legacyButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
});