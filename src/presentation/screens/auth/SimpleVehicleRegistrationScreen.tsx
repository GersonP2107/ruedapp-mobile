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
import { useAuth } from '../../../infrastructure/context/AuthContext';

export default function SimpleVehicleRegistrationScreen() {
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { addVehicleWithValidation } = useAuth();

  const formatPlate = (text: string) => {
    // Formatear placa automáticamente (ABC123)
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 6) {
      setLicensePlate(cleaned);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      setError('Por favor ingrese la placa del vehículo');
      return;
    }

    if (licensePlate.length !== 6) {
      setError('La placa debe tener 6 caracteres (ej: ABC123)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await addVehicleWithValidation(licensePlate);

      if (result.success) {
        const vehicleData = result.validationResult?.vehicleData;
        
        Alert.alert(
          '¡Vehículo Registrado!',
          `Se ha registrado exitosamente su ${vehicleData?.brand} ${vehicleData?.model} ${vehicleData?.year}.\n\nTodos los datos fueron verificados automáticamente con el RUNT.`,
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        // Manejar diferentes tipos de errores
        let errorMessage = result.error || 'Error desconocido';
        let errorTitle = 'Error';

        switch (result.validationResult?.errorCode) {
          case 'VEHICLE_NOT_FOUND':
            errorTitle = 'Vehículo no encontrado';
            errorMessage = 'No se encontró información de este vehículo en el RUNT. Verifique que la placa sea correcta.';
            break;
          case 'OWNER_MISMATCH':
            errorTitle = 'Propietario no coincide';
            errorMessage = 'Este vehículo no está registrado a su nombre en el RUNT. Solo puede registrar vehículos de su propiedad.';
            break;
          case 'INVALID_PLATE':
            errorTitle = 'Placa inválida';
            errorMessage = 'El formato de la placa no es válido. Use el formato ABC123.';
            break;
          case 'INVALID_DOCUMENT':
            errorTitle = 'Documento inválido';
            errorMessage = 'Complete la información de su documento en el perfil.';
            break;
        }

        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Ocurrió un error inesperado. Intente nuevamente.');
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
                <Ionicons name="car-sport" size={32} color="#ffffff" />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Registra tu Vehículo</Text>
              <Text style={styles.subtitle}>
                Solo necesitas la placa. Nosotros nos encargamos del resto.
              </Text>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#44F1A6" />
                <Text style={styles.infoTitle}>Validación Automática</Text>
              </View>
              <Text style={styles.infoText}>
                • Verificamos automáticamente con el RUNT{'\n'}
                • Validamos que el vehículo esté a tu nombre{'\n'}
                • Obtenemos toda la información necesaria{'\n'}
                • Proceso 100% seguro y confiable
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Placa del Vehículo</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                value={licensePlate}
                onChangeText={formatPlate}
                placeholder="ABC123"
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isLoading}
              />
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.helperText}>
                  Formato: 3 letras seguidas de 3 números
                </Text>
              )}
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
                  <Text style={styles.loadingText}>Validando con RUNT...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Registrar Vehículo</Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                ¿Problemas con el registro?{'\n'}
                Asegúrate de que el vehículo esté registrado a tu nombre en el RUNT.
              </Text>
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
    fontSize: 32,
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
  infoCard: {
    backgroundColor: '#f8fffe',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#44F1A6',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  form: {
    marginBottom: 32,
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
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
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
    textAlign: 'center',
  },
  helperText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#44F1A6',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
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
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});