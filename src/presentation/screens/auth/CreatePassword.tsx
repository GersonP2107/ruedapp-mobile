import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Colors } from '../../../../constants/Colors';
import { supabase } from '../../../../lib/supabase';
import { handleAuthError, logError } from '../../../../utils/errorHandling';
import { FormErrors, getPasswordStrength, hasFormErrors, validatePassword } from '../../../../utils/validation';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { ValidatedInput } from '../../components';

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { email, fullName } = useLocalSearchParams<{ email?: string; fullName?: string }>();
  const { isConnected, showNetworkWarning } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#e5e7eb' });

  const validateConfirmPassword = (confirmPass: string) => {
    if (!confirmPass) return { isValid: false, message: 'La confirmación de contraseña es requerida' };
    if (confirmPass !== password) return { isValid: false, message: 'Las contraseñas no coinciden' };
    return { isValid: true };
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const strength = getPasswordStrength(value);
    setPasswordStrength(strength);

    const validation = validatePassword(value);
    setIsPasswordValid(validation.isValid);

    if (hasAttemptedSubmit) {
      setErrors((prev) => ({ ...prev, password: validation.isValid ? undefined : validation.message }));
      if (confirmPassword) {
        const confirmValidation = validateConfirmPassword(confirmPassword);
        setIsConfirmPasswordValid(confirmValidation.isValid);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmValidation.isValid ? undefined : confirmValidation.message }));
      }
    } else {
      if (confirmPassword) {
        const confirmValidation = validateConfirmPassword(confirmPassword);
        setIsConfirmPasswordValid(confirmValidation.isValid);
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const confirmValidation = validateConfirmPassword(value);
    setIsConfirmPasswordValid(confirmValidation.isValid);

    if (hasAttemptedSubmit) {
      setErrors((prev) => ({ ...prev, confirmPassword: confirmValidation.isValid ? undefined : confirmValidation.message }));
    }
  };

  const isFormValid = isPasswordValid && isConfirmPasswordValid;

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);

    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }

    const formErrors: FormErrors = {};
    if (!isPasswordValid) formErrors.password = 'La contraseña no cumple los requisitos';
    const confirmValidation = validateConfirmPassword(confirmPassword);
    if (!confirmValidation.isValid) formErrors.confirmPassword = confirmValidation.message;

    setErrors(formErrors);
    if (hasFormErrors(formErrors)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        const errorResponse = handleAuthError(error);
        Alert.alert(errorResponse.title, errorResponse.message);
        return;
      }

      // Continúa al paso de documento y placa
      router.replace('/vehicle-registration');
    } catch (err: any) {
      logError(err, 'CreatePasswordScreen.handleSubmit', { email });
      const errorResponse = handleAuthError(err);
      Alert.alert(errorResponse.title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Crear contraseña</Text>
              <Text style={styles.subtitle}>
                {email ? `Para ${email}` : 'Define una contraseña segura para tu cuenta.'}
              </Text>
            </View>

            <View style={styles.form}>
              <ValidatedInput
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
                style={[styles.submitButton, (isLoading || !isFormValid) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || !isFormValid}
                accessible={true}
                accessibilityLabel="Guardar contraseña"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading || !isFormValid, busy: isLoading }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.loadingText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Continuar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { paddingTop: 20, paddingBottom: 20 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center',
  },
  content: { flex: 1, justifyContent: 'center' },
  titleContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#000000', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666666', textAlign: 'center', lineHeight: 24 },
  form: { gap: 16 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  submitButton: {
    backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 25,
    alignItems: 'center', marginTop: 8, shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: 'black', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});