import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { handleAuthError, logError } from '../../../../utils/errorHandling';
import { validateEmail } from '../../../../utils/validation';
import ValidatedInput from '../ui/ValidatedInput';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text.trim().toLowerCase());
    if (hasAttemptedSubmit) {
      setIsEmailValid(validateEmail(text.trim()).isValid);
    }
  };

  const handleResetPassword = async () => {
    setHasAttemptedSubmit(true);
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setIsEmailValid(false);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'ruedapp://reset-password',
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      Alert.alert(
        'Correo enviado',
        'Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error: any) {
      logError('Password reset error', error);
      const errorMessage = handleAuthError(error);
      Alert.alert('Error', errorMessage.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsLoading(false);
    setIsEmailValid(false);
    setHasAttemptedSubmit(false);
    setEmailSent(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Recuperar contraseña</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={48} color="#3b82f6" />
          </View>

          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Text>

          <View style={styles.form}>
            <ValidatedInput
              label="Correo electrónico"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading && !emailSent}
              leftIcon="mail-outline"
              validator={validateEmail}
              onValidationChange={setIsEmailValid}
              showValidation={hasAttemptedSubmit}
            />

            <TouchableOpacity
              style={[
                styles.resetButton,
                (!isEmailValid && hasAttemptedSubmit) && styles.resetButtonDisabled,
                emailSent && styles.resetButtonSuccess
              ]}
              onPress={handleResetPassword}
              disabled={isLoading || emailSent || (!isEmailValid && hasAttemptedSubmit)}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.loadingText}>Enviando...</Text>
                </View>
              ) : emailSent ? (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.resetButtonText}>Correo enviado</Text>
                </View>
              ) : (
                <Text style={styles.resetButtonText}>Enviar enlace</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  resetButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  resetButtonSuccess: {
    backgroundColor: '#10b981',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
});