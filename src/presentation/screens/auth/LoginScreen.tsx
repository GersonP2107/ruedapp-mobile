import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { handleAuthError, logError, logMetric, withTimeout } from '../../../../utils/errorHandling';
import { FormErrors, validateEmail } from '../../../../utils/validation';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { ValidatedInput } from '../../components';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const { isConnected, showNetworkWarning, sendOtpLogin } = useAuth();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

      router.push({
        pathname: '/verify-otp',
        params: {
          email: emailTrimmed,
          mode: 'login',
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

  const isFormValid = isEmailValid;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#ffffff', '#f0fdf9', '#ffffff']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.logoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      source={require('../../../../assets/images/ruedapp-icon.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                  <View style={styles.logoGlow} />
                </View>

                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Bienvenido de nuevo</Text>
                  <Text style={styles.subtitle}>
                    Ingresa a tu cuenta de RuedApp
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="mail" size={16} color="#6b7280" /> Correo electrónico
                  </Text>
                  <ValidatedInput
                    placeholder="tu@email.com"
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
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isLoading || !isFormValid) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading || !isFormValid}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityLabel="Enviar código de acceso"
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: isLoading || !isFormValid,
                    busy: isLoading
                  }}
                >
                  <LinearGradient
                    colors={(isLoading || !isFormValid) ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#ffffff" size="small" />
                        <Text style={styles.submitButtonText}>Enviando código...</Text>
                      </View>
                    ) : (
                      <View style={styles.submitContent}>
                        <Text style={styles.submitButtonText}>Continuar</Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>¿No tienes cuenta? </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/signup')}
                    disabled={isLoading}
                    accessible={true}
                    accessibilityLabel="Crear nueva cuenta"
                    accessibilityRole="button"
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signUpLink}>Registrarse</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                <Text style={styles.infoText}>
                  Inicio de sesión seguro con código de verificación
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    opacity: 0.2,
    transform: [{ scale: 1.3 }],
    zIndex: -1,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.2,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpText: {
    color: '#6b7280',
    fontSize: 15,
  },
  signUpLink: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '700',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});