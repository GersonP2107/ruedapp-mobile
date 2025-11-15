import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { handleAuthError, logError } from '../../../../utils/errorHandling';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import OtpInput, { OtpInputRef } from '../../components/ui/OtpInput';

const RESEND_TIMEOUT = 60; // seconds

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email, fullName } = useLocalSearchParams<{ email: string; fullName: string }>();
  const { signUpWithSupabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingInitialOtp, setIsSendingInitialOtp] = useState(true);
  const otpInputRef = useRef<OtpInputRef>(null);

  const sendOtp = async (isResend = false) => {
    if (!email || !fullName) {
      Alert.alert('Error', 'Faltan datos del registro. Vuelve al inicio.');
      router.replace('/signup');
      return;
    }

    if (isResend && resendTimer > 0) return;

    try {
      if (!isResend) {
        setIsSendingInitialOtp(true);
      }
      // Usamos signUpWithSupabase para unificar la lógica de envío de OTP
      const { error } = await signUpWithSupabase(email, fullName, { full_name: fullName });
      if (error) throw error;

      if (isResend) {
        Alert.alert('Código reenviado', 'Revisa tu correo y usa el nuevo código.');
      }
      setResendTimer(RESEND_TIMEOUT);
      otpInputRef.current?.clear();
    } catch (err: any) {
      handleAuthError(err);
      logError(err, `VerifyOTPScreen.sendOtp (isResend: ${isResend})`);
      Alert.alert('Error', 'No pudimos enviar el código. Intenta más tarde.');
      if (!isResend) {
        // Si falla el envío inicial, volver a la pantalla de registro
        router.back();
      }
    } finally {
      if (!isResend) {
        setIsSendingInitialOtp(false);
      }
    }
  };

  // Enviar OTP al cargar la pantalla
  useEffect(() => {
    sendOtp();
  }, [email, fullName]);

  // Temporizador para reenviar
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);
  const verify = async () => {
    if (!email || !fullName) {
      Alert.alert('Error', 'Faltan datos del registro. Vuelve al inicio.');
      router.replace('/signup');
      return;
    }

    try {
      setLoading(true);
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' });
      if (verifyError) throw verifyError;

      // Ir a crear contraseña
      router.replace({
        pathname: '/create-password',
        params: { email, fullName },
      });
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

        <OtpInput onComplete={setOtpCode} disabled={loading} ref={otpInputRef} />

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