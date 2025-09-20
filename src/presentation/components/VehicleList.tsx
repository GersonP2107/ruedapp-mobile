import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../infrastructure/context/AuthContext';
import { useVehicles } from '../../infrastructure/hooks';

interface VehicleListProps {
  onVehicleSelect?: (vehicle: any) => void;
  showAddButton?: boolean;
  onAddVehicle?: () => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  onVehicleSelect,
  showAddButton = true,
  onAddVehicle,
}) => {
  const { vehicles, isLoading, error, fetchVehicles, deleteVehicle } = useVehicles(); 
  const { supabaseUser } = useAuth();

  useEffect(() => {
    if (supabaseUser) {
      fetchVehicles();
    }
  }, [supabaseUser]);

  const handleDeleteVehicle = (vehicleId: string, vehicleName: string) => {
    Alert.alert(
      'Eliminar Vehículo',
      `¿Estás seguro de que deseas eliminar ${vehicleName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteVehicle(vehicleId);
            if (result) {
              Alert.alert('Éxito', 'Vehículo eliminado correctamente');
            } else {
              Alert.alert('Error', 'Error al eliminar vehículo');
            }
          },
        },
      ]
    );
  };

  const renderVehicleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => onVehicleSelect?.(item)}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="car-outline" size={24} color="#2196F3" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>
            {item.brand} {item.model}
          </Text>
          <Text style={styles.vehicleDetails}>
            {item.year} • {item.color}
          </Text>
          <Text style={styles.licensePlate}>{item.license_plate}</Text>
          {item.vehicle_type && (
            <Text style={styles.vehicleType}>{item.vehicle_type.name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVehicle(item.id, `${item.brand} ${item.model}`)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="car-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No tienes vehículos registrados</Text>
      <Text style={styles.emptySubtitle}>
        Agrega tu primer vehículo para comenzar a usar RuedApp
      </Text>
      {showAddButton && (
        <TouchableOpacity style={styles.addButton} onPress={onAddVehicle}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Agregar Vehículo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
      <Text style={styles.errorTitle}>Error al cargar vehículos</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchVehicles}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando vehículos...</Text>
      </View>
    );
  }

  if (error) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      {vehicles.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Mis Vehículos</Text>
            {showAddButton && (
              <TouchableOpacity style={styles.headerAddButton} onPress={onAddVehicle}>
                <Ionicons name="add" size={20} color="#2196F3" />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={vehicles}
            renderItem={renderVehicleItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
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
  headerAddButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  licensePlate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  deleteButton: {
    padding: 8,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
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
});

export default VehicleList;