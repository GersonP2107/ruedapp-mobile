import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { Colors } from '../../../../constants/Colors';
import { handleAuthError, logError, logMetric, withTimeout } from '../../../../utils/errorHandling';
import { FormErrors, validateEmail } from '../../../../utils/validation';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { LoadingScreen, ValidatedInput } from '../../components';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const { isConnected, showNetworkWarning, sendOtpLogin } = useAuth();

  // Nuevo: flujo de login con OTP (envía código y navega a verificación)
  const handleLogin = async () => {
    setHasAttemptedSubmit(true);

    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }

    const emailTrimmed = email.trim();
    const emailValidation = validateEmail(emailTrimmed);
    const formErrors: FormErrors = {
      email: emailValidation.isValid ? undefined : emailValidation.message,
    };
    setErrors(formErrors);
    if (!emailValidation.isValid) return;

    setIsLoading(true);
    const startedAt = Date.now();

    try {
      const { error } = await withTimeout(sendOtpLogin(emailTrimmed), 12000, 'send_otp');
      if (error) {
        const errorResponse = handleAuthError(error);
        Alert.alert(errorResponse.title, errorResponse.message);
        logMetric('otp_send_failed', { email: emailTrimmed, elapsedMs: Date.now() - startedAt });
        return;
      }

      logMetric('otp_send_success', { email: emailTrimmed, elapsedMs: Date.now() - startedAt });

      // Redirigir automáticamente a verificación tras confirmación de envío
      router.push({
        pathname: '/verify-otp',
        params: {
          email: emailTrimmed,
          intent: 'login',
          skipInitialSend: 'true',
        },
      });
    } catch (err) {
      logError('OTP Login Timeout/Network', err as any, { email: emailTrimmed });
      const errorResponse = handleAuthError(err);
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


  const handleLoadingComplete = () => {
    setShowLoading(false);
    // La navegación se maneja automáticamente en el AuthContext
  };

  const isFormValid = isEmailValid;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {showLoading && (
        <LoadingScreen
          title="¡CÓDIGO ENVIADO!"
          subtitle={`Revisa ${email.trim()} para continuar.`}
          duration={2500}
          onComplete={handleLoadingComplete}
        />
      )}
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
            <Image
              source={require('../../../../assets/images/ruedapp-icon.png')}
              style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20, alignSelf: 'center' }}
              resizeMode="contain"
              />

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Iniciar sesión</Text>
              <Text style={styles.subtitle}>
                Bienvenido de vuelta a RuedApp
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ValidatedInput
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

              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  (isLoading || (!isFormValid && hasAttemptedSubmit)) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading || (!isFormValid && hasAttemptedSubmit)}
                accessible={true}
                accessibilityLabel="Enviar código de acceso"
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoading || (!isFormValid && hasAttemptedSubmit),
                  busy: isLoading
                }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.loadingText}>Enviando código...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Enviar código</Text>
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
    gap: 1,
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
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
    color: 'black',
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
    marginBottom: 5,
  },
  signUpText: {
    color: '#666666',
    fontSize: 16,
  },
  signUpLink: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});