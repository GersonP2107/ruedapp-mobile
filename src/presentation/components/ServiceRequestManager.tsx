import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServiceRequests, useVehicles } from '../hooks';
import { useAuth } from '../../infrastructure/context/AuthContext';

interface ServiceRequestManagerProps {
  showCreateButton?: boolean;
}

const ServiceRequestManager: React.FC<ServiceRequestManagerProps> = ({
  showCreateButton = true,
}) => {
  const { requests, loading, error, fetchUserRequests, createServiceRequest, updateRequestStatus } = useServiceRequests();
  const { vehicles } = useVehicles();
  const { supabaseUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    vehicle_id: '',
    service_id: '',
    provider_id: '',
    description: '',
    location_latitude: 0,
    location_longitude: 0,
    address: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (supabaseUser) {
      fetchUserRequests();
    }
  }, [supabaseUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#2196F3';
      case 'in_progress': return '#9C27B0';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.vehicle_id || !newRequest.description.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setCreating(true);
    try {
      const result = await createServiceRequest(newRequest);
      if (result.success) {
        setShowCreateModal(false);
        setNewRequest({
          vehicle_id: '',
          service_id: '',
          provider_id: '',
          description: '',
          location_latitude: 0,
          location_longitude: 0,
          address: '',
        });
        Alert.alert('Éxito', 'Solicitud de servicio creada correctamente');
      } else {
        Alert.alert('Error', result.error || 'Error al crear solicitud');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear solicitud');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de que deseas cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            const result = await updateRequestStatus(requestId, 'cancelled');
            if (result.success) {
              Alert.alert('Éxito', 'Solicitud cancelada');
            } else {
              Alert.alert('Error', result.error || 'Error al cancelar solicitud');
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.requestDate}>
          {new Date(item.created_at).toLocaleDateString('es-ES')}
        </Text>
      </View>

      <View style={styles.requestContent}>
        <Text style={styles.requestDescription}>{item.description}</Text>
        
        {item.vehicle && (
          <View style={styles.vehicleInfo}>
            <Ionicons name="car-outline" size={16} color="#666" />
            <Text style={styles.vehicleText}>
              {item.vehicle.brand} {item.vehicle.model} - {item.vehicle.license_plate}
            </Text>
          </View>
        )}

        {item.service && (
          <View style={styles.serviceInfo}>
            <Ionicons name="construct-outline" size={16} color="#666" />
            <Text style={styles.serviceText}>{item.service.name}</Text>
          </View>
        )}

        {item.provider && (
          <View style={styles.providerInfo}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.providerText}>{item.provider.business_name}</Text>
          </View>
        )}

        {item.address && (
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{item.address}</Text>
          </View>
        )}
      </View>

      <View style={styles.requestActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No tienes solicitudes de servicio</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera solicitud para comenzar a recibir servicios
      </Text>
      {showCreateButton && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Crear Solicitud</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
      <Text style={styles.errorTitle}>Error al cargar solicitudes</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchUserRequests}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nueva Solicitud</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vehículo *</Text>
            <View style={styles.pickerContainer}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleOption,
                    newRequest.vehicle_id === vehicle.id && styles.vehicleOptionSelected
                  ]}
                  onPress={() => setNewRequest(prev => ({ ...prev, vehicle_id: vehicle.id }))}
                >
                  <Text style={[
                    styles.vehicleOptionText,
                    newRequest.vehicle_id === vehicle.id && styles.vehicleOptionTextSelected
                  ]}>
                    {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción del Problema *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe el problema o servicio que necesitas..."
              value={newRequest.description}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dirección</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Dirección donde se requiere el servicio"
              value={newRequest.address}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, address: text }))}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, creating && styles.submitButtonDisabled]}
            onPress={handleCreateRequest}
            disabled={creating}
          >
            <Text style={styles.submitButtonText}>
              {creating ? 'Creando...' : 'Crear Solicitud'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading && requests.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Solicitudes</Text>
        {showCreateButton && requests.length > 0 && (
          <TouchableOpacity
            style={styles.headerCreateButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#2196F3" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        renderError()
      ) : requests.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchUserRequests}
        />
      )}

      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerCreateButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  requestContent: {
    marginBottom: 16,
  },
  requestDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF5252',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  vehicleOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vehicleOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  vehicleOptionText: {
    fontSize: 16,
    color: '#333',
  },
  vehicleOptionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ServiceRequestManager;