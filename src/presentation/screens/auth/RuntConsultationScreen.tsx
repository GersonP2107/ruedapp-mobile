import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RuntSimulationService, RuntVehicleData } from '../../../infrastructure/services/RuntSimulationService';
import { useRuntConsultation } from '../../hooks/useRuntConsultation';

interface RuntConsultationScreenProps {
  onVehicleFound: (vehicleData: RuntVehicleData) => void;
  onSkip: () => void;
}

export const RuntConsultationScreen: React.FC<RuntConsultationScreenProps> = ({
  onVehicleFound,
  onSkip
}) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const docTypes = RuntSimulationService.getValidDocumentTypes();
  const sortedDocTypes = [...docTypes].sort((a, b) => a.label.localeCompare(b.label));
  const [docTypeSearch, setDocTypeSearch] = useState('');
  const [docTypeModalVisible, setDocTypeModalVisible] = useState(false);
  
  const { consultVehicle, loading, error, clearError } = useRuntConsultation();

  const handleConsult = async () => {
    if (!licensePlate.trim() || !documentNumber.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    clearError();

    const response = await consultVehicle({
      licensePlate: licensePlate.trim().toUpperCase(),
      ownerDocumentType: documentType,
      ownerDocumentNumber: documentNumber.trim()
    });

    if (response.success && response.data) {
      Alert.alert(
        'Vehículo Encontrado',
        `Se encontró el vehículo ${response.data.vehicleBrand} ${response.data.vehicleModel} ${response.data.vehicleYear} a nombre de ${response.data.ownerFullName}`,
        [
          {
            text: 'Usar estos datos',
            onPress: () => onVehicleFound(response.data!)
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } else {
      Alert.alert('Error', response.message || 'No se pudo consultar el vehículo');
    }
  };

  const formatPlate = (text: string) => {
    // Formatear placa automáticamente (ABC123)
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 6) {
      setLicensePlate(cleaned);
    }
  };

  const formatDocument = (text: string) => {
    const onlyNumeric = documentType === 'CC' || documentType === 'TI';
    const cleaned = onlyNumeric
      ? text.replace(/[^0-9]/g, '')
      : text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 12) {
      setDocumentNumber(cleaned);
    }
  };

  const getDocumentTypeLabel = (value: string) => {
    const found = docTypes.find(d => d.value === value);
    return found ? found.label : value;
  };

  const getDocPlaceholder = (type: string) => {
    return type === 'CC' || type === 'TI' ? 'Ej: 12345678' : 'Ej: AB123456';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Consulta RUNT</Text>
          <Text style={styles.subtitle}>
            Ingresa la placa y documento del propietario para obtener automáticamente los datos del vehículo
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Placa del Vehículo</Text>
            <TextInput
              style={styles.input}
              value={licensePlate}
              onChangeText={formatPlate}
              placeholder="ABC123"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Documento</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setDocTypeModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Seleccionar tipo de documento"
            >
              <Text style={styles.selectValue}>{getDocumentTypeLabel(documentType)} ({documentType})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Documento</Text>
            <TextInput
              style={styles.input}
              value={documentNumber}
              onChangeText={formatDocument}
              placeholder={getDocPlaceholder(documentType)}
              keyboardType={documentType === 'CC' || documentType === 'TI' ? 'number-pad' : 'default'}
              autoCapitalize="characters"
              maxLength={12}
              accessibilityLabel="Número de documento"
              accessibilityHint="Ingresa solo caracteres alfanuméricos. Se admite formato según tipo seleccionado"
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.consultButton, loading && styles.consultButtonDisabled]}
            onPress={handleConsult}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.consultButtonText}>Consultar Vehículo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>
              Registrar manualmente
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>💡 Información</Text>
          <Text style={styles.infoText}>
            • La consulta RUNT te permite obtener automáticamente los datos del vehículo{'\n'}
            • Necesitas la placa y el documento del propietario{'\n'}
            • Si no tienes estos datos, puedes registrar manualmente
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={docTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDocTypeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Buscar tipo de documento</Text>
            <TextInput
              style={styles.input}
              value={docTypeSearch}
              onChangeText={setDocTypeSearch}
              placeholder="Buscar..."
              autoCorrect={false}
              autoCapitalize="none"
            />
            <FlatList
              data={sortedDocTypes.filter(d => (d.label + ' ' + d.value).toLowerCase().includes(docTypeSearch.toLowerCase()))}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setDocumentType(item.value);
                    setDocTypeModalVisible(false);
                    setDocTypeSearch('');
                  }}
                  accessibilityLabel={`Seleccionar ${item.label}`}
                >
                  <Text style={styles.optionLabel}>{item.label} ({item.value})</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setDocTypeModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
  },
  selectValue: {
    fontSize: 16,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalClose: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  consultButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  consultButtonDisabled: {
    backgroundColor: '#ccc',
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  info: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
});