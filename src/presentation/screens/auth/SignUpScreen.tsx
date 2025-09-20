import { useAuth } from '../../../infrastructure/context/AuthContext';
import { handleAuthError, logError } from '@/utils/errorHandling';
import { FormErrors, getPasswordStrength, hasFormErrors, validateEmail, validateFullName, validatePassword, validateSignupForm } from '@/utils/validation';
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
import { ValidatedInput } from '../../components';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#e5e7eb' });
  const { register, signUpWithSupabase, isConnected, showNetworkWarning } = useAuth();

  const handleSupabaseSignUp = async () => {
    setHasAttemptedSubmit(true);
    
    // Verificar conectividad
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    
    // Validar formulario
    const formErrors = validateSignupForm(fullName, email, password);
    setErrors(formErrors);
    
    if (hasFormErrors(formErrors)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUpWithSupabase(email.trim(), password, {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      
      if (error) {
        const errorResponse = handleAuthError(error);
        Alert.alert(errorResponse.title, errorResponse.message);
      } else {
        Alert.alert(
          'Registro exitoso',
          'Se ha enviado un correo de confirmación. Por favor verifica tu email antes de iniciar sesión.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      }
    } catch (error) {
      logError('Signup', error, { email, fullName });
      const errorResponse = handleAuthError(error);
      Alert.alert(errorResponse.title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegacySignUp = async () => {
    setHasAttemptedSubmit(true);
    
    // Verificar conectividad
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    
    // Validar formulario
    const formErrors = validateSignupForm(fullName, email, password);
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
    if (hasAttemptedSubmit) {
      const nameValidation = validateFullName(value);
      setErrors(prev => ({
        ...prev,
        fullName: nameValidation.isValid ? undefined : nameValidation.message
      }));
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
    const strength = getPasswordStrength(value);
    setPasswordStrength(strength);
    
    if (hasAttemptedSubmit) {
      const passwordValidation = validatePassword(value);
      setErrors(prev => ({
        ...prev,
        password: passwordValidation.isValid ? undefined : passwordValidation.message
      }));
    }
  };

  const isFormValid = isEmailValid && isNameValid && isPasswordValid && !hasFormErrors(errors);

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
                    label="Número de teléfono (opcional)"
                    placeholder="Ingresa tu número de teléfono"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoComplete="tel"
                    editable={!isLoading}
                    leftIcon="call-outline"
                  />

                  <TouchableOpacity 
                    style={[
                      styles.createAccountButton,
                      (isLoading || (!isFormValid && hasAttemptedSubmit)) && styles.createAccountButtonDisabled
                    ]}
                    onPress={handleSupabaseSignUp}
                    disabled={isLoading || (!isFormValid && hasAttemptedSubmit)}
                    accessible={true}
                    accessibilityLabel="Crear cuenta con Supabase"
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: isLoading || (!isFormValid && hasAttemptedSubmit),
                      busy: isLoading
                    }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.loadingText}>Creando cuenta...</Text>
                      </View>
                    ) : (
                      <Text style={styles.createAccountButtonText}>Registrarse con Supabase</Text>
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
        </View>
      </ImageBackground>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
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
  createAccountButtonDisabled: {
    opacity: 0.6,
  },
  createAccountButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  loginLink: {
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