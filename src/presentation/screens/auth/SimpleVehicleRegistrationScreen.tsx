import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../infrastructure/context/AuthContext';

export default function SimpleVehicleRegistrationScreen() {
  const { updateUserProfile, addVehicleWithValidation } = useAuth();
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [docTypeModalVisible, setDocTypeModalVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const SOAT_DOC_TYPES = [
    { value: 'CD', label: 'Carnet Diplomático', icon: 'ribbon' },
    { value: 'CC', label: 'Cédula de Ciudadanía', icon: 'card' },
    { value: 'CE', label: 'Cédula de Extranjería', icon: 'globe' },
    { value: 'NIT', label: 'NIT', icon: 'business' },
    { value: 'PA', label: 'Pasaporte', icon: 'airplane' },
    { value: 'PPT', label: 'Permiso por Protección Temporal', icon: 'shield-checkmark' },
    { value: 'RC', label: 'Registro Civil', icon: 'document-text' },
    { value: 'TI', label: 'Tarjeta de Identidad', icon: 'card-outline' },
  ];

  const formatPlate = (text: string) => {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 6) {
      setLicensePlate(cleaned);
    }
  };

  const formatDocument = (text: string) => {
    const onlyNumeric = documentType === 'CC' || documentType === 'NIT';
    const cleaned = onlyNumeric
      ? text.replace(/[^0-9]/g, '')
      : text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 12) {
      setDocumentNumber(cleaned);
    }
  };

  const getDocumentTypeLabel = (value: string) => {
    const found = SOAT_DOC_TYPES.find(d => d.value === value);
    return found ? found.label : value;
  };

  const getDocumentTypeIcon = (value: string) => {
    const found = SOAT_DOC_TYPES.find(d => d.value === value);
    return found ? found.icon : 'card';
  };

  const getDocPlaceholder = (type: string) => {
    return type === 'CC' || type === 'TI' ? 'Ej: 12345678' : 'Ej: AB123456';
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Por favor ingrese su nombre');
      return;
    }

    if (!documentNumber.trim()) {
      setError(`Por favor ingrese su número de ${getDocumentTypeLabel(documentType)}`);
      return;
    }

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
      const profileUpdateSuccess = await updateUserProfile({
        full_name: fullName,
        document_type: documentType,
        document_number: documentNumber,
      });

      if (!profileUpdateSuccess) {
        Alert.alert('Error de perfil', 'Error al actualizar su información. Intente más tarde.');
        setIsLoading(false);
        return;
      }

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
      <LinearGradient
        colors={['#ffffff', '#f0fdf9', '#ffffff']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
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

            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="car-sport" size={40} color="#ffffff" />
                  </LinearGradient>
                  <View style={styles.iconGlow} />
                </View>

                <Text style={styles.title}>Registra tu Vehículo</Text>
                <Text style={styles.subtitle}>
                  Validación automática con el RUNT.{'\n'}
                  Rápido, seguro y confiable.
                </Text>
              </View>

              {/* Features Cards */}
              <View style={styles.featuresContainer}>
                {[
                  { icon: 'shield-checkmark', text: 'Verificación RUNT', color: '#10b981' },
                  { icon: 'flash', text: 'Proceso rápido', color: '#f59e0b' },
                  { icon: 'lock-closed', text: '100% Seguro', color: '#3b82f6' },
                ].map((feature, index) => (
                  <View key={index} style={styles.featureCard}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                      <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Nombre Completo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Ionicons name="person" size={16} color="#6b7280" /> Nombre Completo
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'name' && styles.inputWrapperFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Juan Pérez González"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="words"
                      editable={!isLoading}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Placa del Vehículo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Ionicons name="car" size={16} color="#6b7280" /> Placa del Vehículo
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    styles.plateInputWrapper,
                    focusedField === 'plate' && styles.inputWrapperFocused,
                    error && styles.inputWrapperError
                  ]}>
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={licensePlate}
                      onChangeText={formatPlate}
                      placeholder="ABC123"
                      placeholderTextColor="#9ca3af"
                      maxLength={6}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('plate')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {licensePlate.length === 6 && (
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    )}
                  </View>
                </View>

                {/* Tipo de Documento */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Ionicons name="document-text" size={16} color="#6b7280" /> Tipo de Documento
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      focusedField === 'docType' && styles.inputWrapperFocused
                    ]}
                    onPress={() => setDocTypeModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.selectContent}>
                      <Ionicons
                        name={getDocumentTypeIcon(documentType) as any}
                        size={20}
                        color="#10b981"
                      />
                      <Text style={styles.selectText}>
                        {getDocumentTypeLabel(documentType)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Número de Documento */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Ionicons name="keypad" size={16} color="#6b7280" /> Número de Documento
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'docNumber' && styles.inputWrapperFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      value={documentNumber}
                      onChangeText={formatDocument}
                      placeholder={getDocPlaceholder(documentType)}
                      placeholderTextColor="#9ca3af"
                      keyboardType={documentType === 'CC' || documentType === 'NIT' ? 'number-pad' : 'default'}
                      autoCapitalize="characters"
                      maxLength={12}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('docNumber')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    {documentType === 'CC' || documentType === 'NIT'
                      ? '📋 Solo números, 6-12 dígitos'
                      : '📋 Alfanumérico, 6-12 caracteres'}
                  </Text>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.submitButtonText}>Validando con RUNT...</Text>
                    </View>
                  ) : (
                    <View style={styles.submitContent}>
                      <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Registrar Vehículo</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Help Section */}
              <View style={styles.helpSection}>
                <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
                <Text style={styles.helpText}>
                  El vehículo debe estar registrado a tu nombre en el RUNT
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal de selección de tipo de documento */}
        <Modal
          visible={docTypeModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDocTypeModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <BlurView intensity={20} style={styles.blurView}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tipo de Documento</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setDocTypeModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={28} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={SOAT_DOC_TYPES}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        documentType === item.value && styles.modalOptionSelected
                      ]}
                      onPress={() => {
                        setDocumentType(item.value);
                        setDocTypeModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalOptionContent}>
                        <View style={[
                          styles.modalOptionIcon,
                          documentType === item.value && styles.modalOptionIconSelected
                        ]}>
                          <Ionicons
                            name={item.icon as any}
                            size={24}
                            color={documentType === item.value ? '#10b981' : '#6b7280'}
                          />
                        </View>
                        <View style={styles.modalOptionText}>
                          <Text style={[
                            styles.modalOptionLabel,
                            documentType === item.value && styles.modalOptionLabelSelected
                          ]}>
                            {item.label}
                          </Text>
                          <Text style={styles.modalOptionValue}>{item.value}</Text>
                        </View>
                      </View>
                      {documentType === item.value && (
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                />
              </View>
            </BlurView>
          </View>
        </Modal>
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
    paddingBottom: 40,
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
  },
  heroSection: {
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
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  plateInputWrapper: {
    backgroundColor: '#f9fafb',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 14,
    fontWeight: '500',
  },
  plateInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  blurView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  modalOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionIconSelected: {
    backgroundColor: '#d1fae5',
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  modalOptionLabelSelected: {
    color: '#059669',
  },
  modalOptionValue: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
});