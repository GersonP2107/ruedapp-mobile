import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../../lib/supabase';
import { handleAuthError, logError, logMetric, withTimeout } from '../../../../utils/errorHandling';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import OtpInput, { OtpInputRef } from '../../components/ui/OtpInput';

const RESEND_TIMEOUT = 60; // seconds

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email, mode, skipInitialSend } = useLocalSearchParams<{ email: string, mode?: "login" | "signup", skipInitialSend?: string }>();
  const { signUpWithSupabase, sendOtpLogin, isConnected, showNetworkWarning } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingInitialOtp, setIsSendingInitialOtp] = useState(true);
  const [codeValidityTimer, setCodeValidityTimer] = useState(0);
  const otpInputRef = useRef<OtpInputRef>(null);
  const CODE_VALIDITY_SECONDS = 300;

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isSendingInitialOtp) {
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
      ]).start();

      // Animación de pulso para el icono
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSendingInitialOtp]);

  const sendOtp = async (isResend = false) => {
    const emailStr = typeof email === 'string' ? email.trim() : '';
    if (!emailStr) {
      Alert.alert('Error', 'Faltan datos del registro. Vuelve al inicio.');
      router.replace('/signup');
      return;
    }
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }
    if (loading) return;
    if (isResend && resendTimer > 0) return;

    try {
      if (!isResend) setIsSendingInitialOtp(true);

      const startedAt = Date.now();
      let error;
      if (mode === 'login') {
        ({ error } = await withTimeout(sendOtpLogin(emailStr), 12000, 'send_otp'));
      } else {
        ({ error } = await withTimeout(signUpWithSupabase(emailStr), 12000, 'send_otp'));
      }
      if (error) throw error;

      logMetric('otp_send_success_verify_screen', { email: emailStr, mode, elapsedMs: Date.now() - startedAt });

      if (isResend) {
        Alert.alert('Código reenviado', 'Revisa tu correo y usa el nuevo código.');
      }
      setResendTimer(RESEND_TIMEOUT);
      setCodeValidityTimer(CODE_VALIDITY_SECONDS);
      otpInputRef.current?.clear();
      otpInputRef.current?.focus();
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('For security purposes')) {
        const match = msg.match(/after\s+(\d+)\s+seconds/);
        const wait = match ? Number(match[1]) : RESEND_TIMEOUT;
        setResendTimer(wait);
        setCodeValidityTimer(CODE_VALIDITY_SECONDS);
        setIsSendingInitialOtp(false);
        logMetric('otp_rate_limited', { email: emailStr, mode, waitSeconds: wait });
        Alert.alert('Espera para reenviar', `Podrás reenviar en ${wait} segundos.`);
      } else if (msg.includes('Error sending magic link email')) {
        logError(err, `VerifyOTPScreen.sendOtp (Supabase Email Error)`);
        Alert.alert(
          'Problema de envío',
          'El servicio de correos está saturado o no configurado. Por favor intenta más tarde o contacta soporte.'
        );
        if (!isResend) router.back();
      } else {
        handleAuthError(err);
        logError(err, `VerifyOTPScreen.sendOtp (isResend: ${isResend})`);
        Alert.alert('Error', 'No pudimos enviar el código. Intenta más tarde.');
        if (!isResend) router.back();
      }
    } finally {
      if (!isResend) setIsSendingInitialOtp(false);
    }
  };

  useEffect(() => {
    const shouldSkip = skipInitialSend === 'true';
    if (shouldSkip) {
      setIsSendingInitialOtp(false);
      setResendTimer(RESEND_TIMEOUT);
      setCodeValidityTimer(CODE_VALIDITY_SECONDS);
      logMetric('otp_initial_send_skipped', { email, mode });
      otpInputRef.current?.focus();
      return;
    }
    sendOtp(false);
  }, [email, skipInitialSend]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [resendTimer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (codeValidityTimer > 0) {
      interval = setInterval(() => {
        setCodeValidityTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [codeValidityTimer]);

  const verify = async () => {
    const emailStr = typeof email === 'string' ? email.trim() : '';
    if (!emailStr) {
      Alert.alert('Error', 'Faltan datos del registro. Vuelve al inicio.');
      router.replace('/signup');
      return;
    }
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }

    try {
      setLoading(true);
      const startedAt = Date.now();
      const { error: verifyError } = await withTimeout(
        supabase.auth.verifyOtp({ email: emailStr, token: otpCode, type: 'email' }),
        12000,
        'verify_otp'
      );
      if (verifyError) throw verifyError;

      logMetric('otp_verify_success', { email: emailStr, mode, elapsedMs: Date.now() - startedAt });

      try {
        if (mode === 'login') {
          router.replace({ pathname: '/(tabs)', params: { email: emailStr } });
        } else {
          router.replace({ pathname: '/vehicle-registration', params: { email: emailStr } });
        }
        logMetric('navigation_success', { to: mode === 'login' ? '/(tabs)' : '/vehicle-registration' });
      } catch (navErr) {
        logError(navErr as any, 'VerifyOTPScreen.navigation_failed');
        logMetric('navigation_failed', { error: (navErr as any)?.message });
      }
    } catch (err: any) {
      handleAuthError(err);
      logError(err, 'VerifyOTPScreen.verify');
      Alert.alert('Código inválido', 'Revisa el código e inténtalo nuevamente.');
      otpInputRef.current?.clear();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (loading || isSendingInitialOtp || resendTimer > 0) return;
    sendOtp(true);
  };

  if (isSendingInitialOtp) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <LinearGradient
          colors={['#ffffff', '#f0fdf9', '#ffffff']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Enviando código de verificación...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#ffffff', '#f0fdf9', '#ffffff']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="mail-open" size={40} color="#ffffff" />
              </LinearGradient>
              <View style={styles.iconGlow} />
            </Animated.View>

            <Text style={styles.title}>Verifica tu correo</Text>
            <Text style={styles.subtitle}>
              Hemos enviado un código de 6 dígitos a
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.timerText}>
              Código válido por {Math.floor(codeValidityTimer / 60)}:{String(codeValidityTimer % 60).padStart(2, '0')}
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <OtpInput
              onComplete={setOtpCode}
              disabled={loading}
              ref={otpInputRef}
              autoFillFromClipboard
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!otpCode || otpCode.length < 6 || loading) && styles.verifyButtonDisabled
            ]}
            disabled={!otpCode || otpCode.length < 6 || loading}
            onPress={verify}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!otpCode || otpCode.length < 6 || loading) ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
              style={styles.verifyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.verifyButtonText}>Verificando...</Text>
                </View>
              ) : (
                <View style={styles.verifyContent}>
                  <Text style={styles.verifyButtonText}>Verificar código</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendQuestion}>¿No recibiste el código?</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={resend}
              disabled={resendTimer > 0}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.resendText,
                resendTimer > 0 && styles.resendTextDisabled
              ]}>
                {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar código'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <Ionicons name="shield-checkmark" size={18} color="#10b981" />
            <Text style={styles.infoText}>
              Verifica tu bandeja de spam si no ves el correo
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    padding: 24,
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
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    opacity: 0.2,
    transform: [{ scale: 1.3 }],
    zIndex: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    alignSelf: 'center',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  otpContainer: {
    marginBottom: 32,
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0.1,
  },
  verifyGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  verifyContent: {
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
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendQuestion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  resendTextDisabled: {
    color: '#9ca3af',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});