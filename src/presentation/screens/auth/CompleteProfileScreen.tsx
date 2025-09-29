import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function CompleteProfileScreen() {
  const { profile, updateProfile } = useUserProfile();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [documentNumber, setDocumentNumber] = useState(profile?.document_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!documentNumber.trim()) {
      newErrors.documentNumber = 'El número de cédula es requerido';
    } else if (!/^[0-9]{6,12}$/.test(documentNumber)) {
      newErrors.documentNumber = 'Ingrese un número de cédula válido (6-12 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await updateProfile({
        full_name: fullName.trim(),
        document_type: 'CC',
        document_number: documentNumber.trim(),
      });

      if (result.success) {
        Alert.alert(
          'Perfil Completado',
          'Su información ha sido guardada exitosamente.',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/vehicle-registration'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo actualizar el perfil');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="person" size={32} color="#ffffff" />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Completa tu Perfil</Text>
              <Text style={styles.subtitle}>
                Necesitamos esta información para validar tu vehículo con el RUNT
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ingrese su nombre completo"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de Cédula</Text>
                <TextInput
                  style={[styles.input, errors.documentNumber && styles.inputError]}
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                  placeholder="Ingrese su número de cédula"
                  keyboardType="numeric"
                  maxLength={12}
                  editable={!isLoading}
                />
                {errors.documentNumber && (
                  <Text style={styles.errorText}>{errors.documentNumber}</Text>
                )}
                <Text style={styles.helperText}>
                  Solo números, sin puntos ni espacios
                </Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#44F1A6" />
                <Text style={styles.infoTitle}>Información Segura</Text>
              </View>
              <Text style={styles.infoText}>
                Esta información se usa únicamente para validar la propiedad de su vehículo con el RUNT. Sus datos están protegidos y no se comparten con terceros.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Guardando...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Guardar y Continuar</Text>
              )}
            </TouchableOpacity>
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
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#44F1A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#44F1A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
  },
  helperText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#f8fffe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#44F1A6',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#44F1A6',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#44F1A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});