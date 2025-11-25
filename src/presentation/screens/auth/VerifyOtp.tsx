import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../../lib/supabase';
import { handleAuthError, logError, logMetric, withTimeout } from '../../../../utils/errorHandling';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import OtpInput, { OtpInputRef } from '../../components/ui/OtpInput';

const RESEND_TIMEOUT = 60; // seconds

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email, intent, skipInitialSend } = useLocalSearchParams<{ email: string, intent?: "login" | "signup", skipInitialSend?: string }>();
  const { signUpWithSupabase, sendOtpLogin, isConnected, showNetworkWarning } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingInitialOtp, setIsSendingInitialOtp] = useState(true);
  const [codeValidityTimer, setCodeValidityTimer] = useState(0);
  const otpInputRef = useRef<OtpInputRef>(null);
  const hasTriggeredInitialSend = useRef(false);
  const CODE_VALIDITY_SECONDS = 300;

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
    // No bloquear envío inicial por isSendingInitialOtp; solo evitar si estamos verificando código
    if (loading) return;
    if (isResend && resendTimer > 0) return;

    try {
      if (!isResend) setIsSendingInitialOtp(true);

      const startedAt = Date.now();
      let error;
      if (intent === 'login') {
        ({ error } = await withTimeout(sendOtpLogin(emailStr), 12000, 'send_otp'));
      } else {
        ({ error } = await withTimeout(signUpWithSupabase(emailStr), 12000, 'send_otp'));
      }
      if (error) throw error;

      logMetric('otp_send_success_verify_screen', { email: emailStr, intent, elapsedMs: Date.now() - startedAt });

      if (isResend) {
        Alert.alert('Código reenviado', 'Revisa tu correo y usa el nuevo código.');
      }
      setResendTimer(RESEND_TIMEOUT);
      setCodeValidityTimer(CODE_VALIDITY_SECONDS);
      otpInputRef.current?.clear();
      otpInputRef.current?.focus();
    } catch (err: any) {
      const msg = String(err?.message || '');
      // Manejo específico de rate limit de Supabase
      if (msg.includes('For security purposes')) {
        const match = msg.match(/after\s+(\d+)\s+seconds/);
        const wait = match ? Number(match[1]) : RESEND_TIMEOUT;
        setResendTimer(wait);
        setCodeValidityTimer(CODE_VALIDITY_SECONDS);
        setIsSendingInitialOtp(false);
        logMetric('otp_rate_limited', { email: emailStr, intent, waitSeconds: wait });
        Alert.alert('Espera para reenviar', `Podrás reenviar en ${wait} segundos.`);
        // No regreses de pantalla en este caso
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

  // Enviar OTP al cargar la pantalla: omitir si viene de Login con envío previo
  useEffect(() => {
    const shouldSkip = skipInitialSend === 'true';
    if (shouldSkip) {
      setIsSendingInitialOtp(false);
      setResendTimer(RESEND_TIMEOUT);
      setCodeValidityTimer(CODE_VALIDITY_SECONDS);
      logMetric('otp_initial_send_skipped', { email, intent });
      otpInputRef.current?.focus();
      return;
    }
    sendOtp(false);
  }, [email, skipInitialSend]);

  // Enviar OTP al cargar la pantalla (una sola vez)
  // Elimina este bloque duplicado que reenvía OTP una vez (causaba rate-limit):
  // useEffect(() => {
  //   if (hasTriggeredInitialSend.current) return;
  //   hasTriggeredInitialSend.current = true;
  //   sendOtp(false);
  // }, [email]);

  // Temporizador para reenviar
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [resendTimer]);

  // Temporizador de validez del código
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

      logMetric('otp_verify_success', { email: emailStr, intent, elapsedMs: Date.now() - startedAt });

      try {
        if (intent === 'login') {
          router.replace({ pathname: '/(tabs)', params: { email: emailStr } });
        } else {
          router.replace({ pathname: '/vehicle-registration', params: { email: emailStr } });
        }
        logMetric('navigation_success', { to: intent === 'login' ? '/(tabs)' : '/vehicle-registration' });
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
        <ActivityIndicator size="large" color="#34D399" />
        <Text style={styles.loadingText}>Enviando código de verificación...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={require('../../../../assets/images/login-image.png')} // Placeholder
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Verificación</Text>
        </View>

        <Text style={styles.subtitle}>Ingresa el código</Text>
        <Text style={styles.caption}>
          Hemos enviado un código de 6 dígitos a <Text style={styles.emailText}>{email}</Text>
        </Text>

        {/* Indicador de validez del código */}
        <Text style={[styles.caption, { marginTop: -16 }]}>
          Código válido por {codeValidityTimer > 0 ? `${codeValidityTimer}s` : '0s'}
        </Text>

        <OtpInput onComplete={setOtpCode} disabled={loading} ref={otpInputRef} autoFillFromClipboard />

        <TouchableOpacity
          style={[styles.button, (!otpCode || otpCode.length < 6) && styles.buttonDisabled]}
          disabled={!otpCode || otpCode.length < 6 || loading}
          onPress={verify}
        >
          <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendContainer} onPress={resend} disabled={resendTimer > 0}>
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            Reenviar código {resendTimer > 0 ? `(${resendTimer}s)` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerImage: {
    width: 200,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emailText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    width: '100%',
    backgroundColor: '#34D399', // emerald-400
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#3B82F6', // blue-500
    fontWeight: '500',
  },
  resendDisabled: {
    color: '#9CA3AF', // gray-400
  },
});