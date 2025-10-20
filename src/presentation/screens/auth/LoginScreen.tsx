import { handleAuthError, logError } from '@/utils/errorHandling';
import { FormErrors, hasFormErrors, validateEmail, validateLoginForm } from '@/utils/validation';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { ForgotPasswordModal, LoadingScreen, ValidatedInput } from '../../components';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { login, signInWithSupabase, isConnected, showNetworkWarning } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isConnected) {
        showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      } else {
        // Simular una consulta/chequeo rápido y mostrar mensaje de éxito
        await new Promise(resolve => setTimeout(resolve, 800));
        Alert.alert('Consulta exitosa');
      }
    } finally {
      setRefreshing(false);
    }
  };

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
        // Mostrar pantalla de carga antes de la redirección
        setIsLoading(false);
        setShowLoading(true);
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
        // Mostrar pantalla de carga antes de la redirección
        setIsLoading(false);
        setShowLoading(true);
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

  const handleLoadingComplete = () => {
    setShowLoading(false);
    // La navegación se maneja automáticamente en el AuthContext
  };

  const isFormValid = !hasFormErrors(validateLoginForm(email, password));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {showLoading && (
        <LoadingScreen
          title="¡BIENVENIDO!"
          subtitle="Accediendo a tu cuenta..."
          duration={2500}
          onComplete={handleLoadingComplete}
        />
      )}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#44F1A6"]}
              tintColor="#44F1A6"
              title={refreshing ? 'Actualizando...' : ''}
            />
          }
        >
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
              <Text style={styles.title}>Iniciar sesión</Text>
              <Text style={styles.subtitle}>
                Bienvenido de vuelta a RuedApp
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
                accessibilityLabel="Iniciar sesión"
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
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
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
    gap: 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#44F1A6',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  signUpText: {
    color: '#666666',
    fontSize: 16,
  },
  signUpLink: {
    color: '#44F1A6',
    fontSize: 16,
    fontWeight: '600',
  },
});