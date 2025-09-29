import { logError } from '@/utils/errorHandling';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { LoadingScreen, ValidatedInput } from '../../components';
import { supabase } from '../../../../lib/supabase';
import { RuntVehicleData } from '../../../infrastructure/services/RuntSimulationService';

// Tipo específico para errores del formulario de vehículos
interface VehicleFormErrors {
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  vehicleType?: string;
}

// Tipos de vehículos disponibles
const VEHICLE_TYPES = [
  { id: 'car', label: 'Automóvil', icon: 'car-sport' },
  { id: 'motorcycle', label: 'Motocicleta', icon: 'bicycle' },
  { id: 'truck', label: 'Camión', icon: 'bus' },
  { id: 'van', label: 'Camioneta', icon: 'car' },
];

// Validaciones específicas para vehículos
const validatePlate = (plate: string) => {
  if (!plate.trim()) {
    return { isValid: false, message: 'La placa es requerida' };
  }
  // Validación básica de placa colombiana (3 letras + 3 números)
  const plateRegex = /^[A-Z]{3}[0-9]{3}$/;
  if (!plateRegex.test(plate.toUpperCase().replace(/\s/g, ''))) {
    return { isValid: false, message: 'Formato de placa inválido (ej: ABC123)' };
  }
  return { isValid: true };
};

const validateBrand = (brand: string) => {
  if (!brand.trim()) {
    return { isValid: false, message: 'La marca es requerida' };
  }
  if (brand.length < 2) {
    return { isValid: false, message: 'La marca debe tener al menos 2 caracteres' };
  }
  return { isValid: true };
};

const validateModel = (model: string) => {
  if (!model.trim()) {
    return { isValid: false, message: 'El modelo es requerido' };
  }
  if (model.length < 2) {
    return { isValid: false, message: 'El modelo debe tener al menos 2 caracteres' };
  }
  return { isValid: true };
};

const validateYear = (year: string) => {
  if (!year.trim()) {
    return { isValid: false, message: 'El año es requerido' };
  }
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
    return { isValid: false, message: `Año inválido (1900-${currentYear + 1})` };
  }
  return { isValid: true };
};

// Interface para tipos de vehículo desde Supabase
interface VehicleTypeFromDB {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface VehicleRegistrationScreenProps {
  prefilledData?: RuntVehicleData | null;
  onBackToRunt?: () => void;
}

export default function VehicleRegistrationScreen({ 
  prefilledData, 
  onBackToRunt 
}: VehicleRegistrationScreenProps = {}) {
  const [vehicleType, setVehicleType] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [isPlateValid, setIsPlateValid] = useState(false);
  const [isBrandValid, setIsBrandValid] = useState(false);
  const [isModelValid, setIsModelValid] = useState(false);
  const [isYearValid, setIsYearValid] = useState(false);
  const [isColorValid, setIsColorValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [vehicleTypesFromDB, setVehicleTypesFromDB] = useState<VehicleTypeFromDB[]>([]);

  const { addVehicle } = useAuth();

  // Función para mapear tipo de vehículo del RUNT a nuestros tipos
  const mapRuntVehicleType = (runtType: string): string => {
    const typeMapping: { [key: string]: string } = {
      'Automóvil': 'car',
      'Motocicleta': 'motorcycle',
      'Camioneta': 'van',
      'Camión': 'truck',
    };
    return typeMapping[runtType] || 'car';
  };

  // Efecto para cargar datos prefilled del RUNT
  useEffect(() => {
    if (prefilledData) {
      setPlate(prefilledData.licensePlate);
      setBrand(prefilledData.vehicleBrand);
      setModel(prefilledData.vehicleModel);
      setYear(prefilledData.vehicleYear.toString());
      setColor(prefilledData.vehicleColor);
      setVehicleType(mapRuntVehicleType(prefilledData.vehicleType));
      
      // Marcar campos como válidos ya que vienen del RUNT
      setIsPlateValid(true);
      setIsBrandValid(true);
      setIsModelValid(true);
      setIsYearValid(true);
      setIsColorValid(true);
    }
  }, [prefilledData]);

  // Función para obtener los tipos de vehículo desde Supabase
  const fetchVehicleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setVehicleTypesFromDB(data || []);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      logError('VehicleRegistration', error, { context: 'fetchVehicleTypes' });
    }
  };

  // Función para obtener el ID del tipo de vehículo
  const getVehicleTypeId = (vehicleTypeKey: string): string => {
    const typeMapping: { [key: string]: string } = {
      'car': 'Automóvil',
      'motorcycle': 'Motocicleta',
      'truck': 'Camioneta',
      'van': 'Camioneta',
    };
    
    const typeName = typeMapping[vehicleTypeKey];
    const vehicleTypeFromDB = vehicleTypesFromDB.find(vt => vt.name === typeName);
    
    // Si no encontramos el tipo, usar el primer tipo disponible como fallback
    return vehicleTypeFromDB?.id || vehicleTypesFromDB[0]?.id || '';
  };

  // Cargar tipos de vehículo al montar el componente
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const handlePlateChange = (value: string) => {
    // Formatear placa automáticamente
    const formattedPlate = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPlate(formattedPlate);
    const plateValidation = validatePlate(formattedPlate);
    setIsPlateValid(plateValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        plate: plateValidation.isValid ? undefined : plateValidation.message
      }));
    }
  };

  const handleBrandChange = (value: string) => {
    setBrand(value);
    const brandValidation = validateBrand(value);
    setIsBrandValid(brandValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        brand: brandValidation.isValid ? undefined : brandValidation.message
      }));
    }
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    const modelValidation = validateModel(value);
    setIsModelValid(modelValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        model: modelValidation.isValid ? undefined : modelValidation.message
      }));
    }
  };

  const handleYearChange = (value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    setYear(numericValue);
    const yearValidation = validateYear(numericValue);
    setIsYearValid(yearValidation.isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        year: yearValidation.isValid ? undefined : yearValidation.message
      }));
    }
  };

  const handleColorChange = (value: string) => {
    setColor(value);
    const isValid = value.trim().length >= 3;
    setIsColorValid(isValid);
    
    if (hasAttemptedSubmit) {
      setErrors(prev => ({
        ...prev,
        color: isValid ? undefined : 'El color debe tener al menos 3 caracteres'
      }));
    }
  };



  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    
    // Validar todos los campos
    const plateValidation = validatePlate(plate);
    const brandValidation = validateBrand(brand);
    const modelValidation = validateModel(model);
    const yearValidation = validateYear(year);
    
    setIsPlateValid(plateValidation.isValid);
    setIsBrandValid(brandValidation.isValid);
    setIsModelValid(modelValidation.isValid);
    setIsYearValid(yearValidation.isValid);
    setIsColorValid(color.trim().length > 0);

    const newErrors: VehicleFormErrors = {};
    if (!plateValidation.isValid) newErrors.plate = plateValidation.message;
    if (!brandValidation.isValid) newErrors.brand = brandValidation.message;
    if (!modelValidation.isValid) newErrors.model = modelValidation.message;
    if (!yearValidation.isValid) newErrors.year = yearValidation.message;
    if (!color.trim()) newErrors.color = 'El color es requerido';
    if (!vehicleType) newErrors.vehicleType = 'Selecciona un tipo de vehículo';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Verificar que tenemos tipos de vehículo cargados
    if (vehicleTypesFromDB.length === 0) {
      Alert.alert('Error', 'No se pudieron cargar los tipos de vehículo. Intenta nuevamente.');
      return;
    }

    const vehicleTypeId = getVehicleTypeId(vehicleType);
    if (!vehicleTypeId) {
      Alert.alert('Error', 'Tipo de vehículo no válido. Intenta nuevamente.');
      return;
    }

    setIsLoading(true);
    setShowLoading(true);

    try {
      const vehicleData = {
        vehicleTypeId,
        licensePlate: plate.toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year),
        color: color.trim(),
      };

      console.log('Datos del vehículo a enviar:', vehicleData);

      const result = await addVehicle({
        vehicle_type_id: vehicleTypeId,
        license_plate: plate.toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year),
        color: color.trim(),
        mileage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (result) {
        Alert.alert(
          'Éxito',
          prefilledData 
            ? 'Vehículo registrado exitosamente con datos del RUNT'
            : 'Vehículo registrado exitosamente',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result || 'No se pudo registrar el vehículo');
      }
    } catch (error) {
      logError('Error registering vehicle', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
      setShowLoading(false);
    }
  };

  if (showLoading) {
    return (
      <LoadingScreen
        title="Registrando tu vehículo..."
        subtitle="Por favor espera un momento"
        onComplete={() => setShowLoading(false)}
        duration={2000}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (onBackToRunt) {
                  onBackToRunt();
                } else {
                  router.back();
                }
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="car-sport" size={32} color="#ffffff" />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {prefilledData ? 'Confirmar Datos' : 'Registra tu Vehículo'}
              </Text>
              <Text style={styles.subtitle}>
                {prefilledData 
                  ? 'Verifica y completa la información obtenida del RUNT'
                  : 'Completa la información de tu vehículo para continuar'
                }
              </Text>
            </View>

            {/* Mostrar información del RUNT si está disponible */}
            {prefilledData && (
              <View style={styles.runtInfoContainer}>
                <View style={styles.runtInfoHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#44F1A6" />
                  <Text style={styles.runtInfoTitle}>Datos obtenidos del RUNT</Text>
                </View>
                <Text style={styles.runtInfoText}>
                  Propietario: {prefilledData.ownerFullName}
                </Text>
                {prefilledData.soatExpiryDate && (
                  <Text style={styles.runtInfoText}>
                    SOAT vigente hasta: {prefilledData.soatExpiryDate}
                  </Text>
                )}
                {onBackToRunt && (
                  <TouchableOpacity 
                    style={styles.changeDataButton}
                    onPress={onBackToRunt}
                  >
                    <Text style={styles.changeDataButtonText}>
                      Consultar otro vehículo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Vehicle Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Vehículo</Text>
              <View style={styles.vehicleTypeContainer}>
                {VEHICLE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.vehicleTypeButton,
                      vehicleType === type.id && styles.vehicleTypeButtonSelected,
                    ]}
                    onPress={() => setVehicleType(type.id)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={vehicleType === type.id ? '#ffffff' : '#666666'}
                    />
                    <Text
                      style={[
                        styles.vehicleTypeText,
                        vehicleType === type.id && styles.vehicleTypeTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.vehicleType && (
                <Text style={styles.errorText}>{errors.vehicleType}</Text>
              )}
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ValidatedInput
                label="Placa"
                value={plate}
                onChangeText={handlePlateChange}
                placeholder="ABC123"
                isValid={isPlateValid}
                error={errors.plate}
                autoCapitalize="characters"
                maxLength={6}
                editable={!prefilledData} // No editable si viene del RUNT
              />

              <ValidatedInput
                label="Marca"
                value={brand}
                onChangeText={handleBrandChange}
                placeholder="Toyota, Honda, etc."
                isValid={isBrandValid}
                error={errors.brand}
                editable={!prefilledData}
              />

              <ValidatedInput
                label="Modelo"
                value={model}
                onChangeText={handleModelChange}
                placeholder="Corolla, Civic, etc."
                isValid={isModelValid}
                error={errors.model}
                editable={!prefilledData}
              />

              <ValidatedInput
                label="Año"
                value={year}
                onChangeText={handleYearChange}
                placeholder="2020"
                keyboardType="numeric"
                isValid={isYearValid}
                error={errors.year}
                maxLength={4}
                editable={!prefilledData}
              />

              <ValidatedInput
                label="Color"
                value={color}
                onChangeText={handleColorChange}
                placeholder="Blanco, Negro, etc."
                isValid={isColorValid}
                error={errors.color}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Registrando...</Text>
                </View>
              ) : (
                <Text style={styles.registerButtonText}>
                  {prefilledData ? 'Confirmar Registro' : 'Registrar Vehículo'}
                </Text>
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
    shadowOffset: {
      width: 0,
      height: 8,
    },
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
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vehicleTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 8,
  },
  vehicleTypeButtonSelected: {
    borderColor: '#44F1A6',
    backgroundColor: '#44F1A6',
  },
  vehicleTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  vehicleTypeTextSelected: {
    color: '#ffffff',
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
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
  registerButton: {
    backgroundColor: '#44F1A6',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#44F1A6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Estilos para la información del RUNT
  runtInfoContainer: {
    backgroundColor: '#f8fffe',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#44F1A6',
  },
  runtInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  runtInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  runtInfoText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 4,
  },
  changeDataButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#44F1A6',
    alignSelf: 'flex-start',
  },
  changeDataButtonText: {
    fontSize: 14,
    color: '#44F1A6',
    fontWeight: '500',
  },
});