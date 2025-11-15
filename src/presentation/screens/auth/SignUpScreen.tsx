import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { FormErrors, validateEmail } from "../../../../utils/validation";
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { ValidatedInput } from '../../components';
import SocialSignInButtons from '../../components/ui/SocialSignInButtons';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const { isConnected, showNetworkWarning } = useAuth();


  const handleEmailChange = (value: string) => {
    // Normaliza el email para evitar espacios
    const normalized = value.trim();
    setEmail(normalized);
    const emailValidation = validateEmail(normalized);
    setIsEmailValid(emailValidation.isValid);

    if (hasAttemptedSubmit) {
      setErrors((prev) => ({
        ...prev,
        email: emailValidation.isValid ? undefined : emailValidation.message,
      }));
    }
  };

  const isFormValid = isEmailValid && isNameValid;

  const handleProceedToVerification = () => {
    setHasAttemptedSubmit(true);

    // Si no hay conexión, muestra advertencia inmediata
    if (!isConnected) {
      showNetworkWarning('Sin conexión a internet. Verifica tu conexión y vuelve a intentar.');
      return;
    }

    // Ejecuta validaciones en el clic, con feedback visual y alerta
    const trimmedEmail = email.trim();
    const emailValidation = validateEmail(trimmedEmail);
    const formErrors: FormErrors = {
      email: emailValidation.isValid ? undefined : emailValidation.message,
    };
    setErrors(formErrors);

    router.push({
      pathname: '/verify-otp',
      params: { email: trimmedEmail },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          // Permite que el botón reciba clics aunque el teclado esté abierto
          keyboardShouldPersistTaps="handled"
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
              {/* Logo */}
              <Image
                source={require('../../../../assets/images/ruedapp-icon.png')}
                style={{ width: 80, height: 80, borderRadius: 16}}
                resizeMode="contain"
              />
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
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={true}
                leftIcon="mail-outline"
                error={errors.email}
                validator={validateEmail}
                onValidationChange={setIsEmailValid}
                showValidation={hasAttemptedSubmit}
              />
              {/* Botón */}
              <TouchableOpacity
                style={[
                  styles.createAccountButton,
                  !isFormValid && styles.createAccountButtonDisabled,
                ]}
                onPress={handleProceedToVerification}
                disabled={!isFormValid}
                accessible={true}
                accessibilityLabel="Continuar a la verificación de correo"
                accessibilityRole="button"
                accessibilityHint="Navega a la pantalla de verificación de correo"
                accessibilityState={{ disabled: !isFormValid }}
                testID="signup-confirm-email-button"
              >
                <Text style={styles.createAccountButtonText}>Confirmar correo</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/login')} 
                  disabled={false}
                  accessible={true}
                  accessibilityLabel="Iniciar sesión"
                  accessibilityRole="button"
                  accessibilityHint="Navega a la página de inicio de sesión"
                >
                  <Text style={styles.loginLink}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
              <SocialSignInButtons />
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
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: 'black',
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
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
    fontSize: 16,
  },
  loginLink: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});