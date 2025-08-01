import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Tipos para los vehículos
interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: number;
  color: string;
  isActive: boolean;
}

const ProfileScreen = () => {
  // Estado para múltiples vehículos
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      model: 'Toyota Corolla',
      plate: 'ABC-123',
      year: 2020,
      color: 'Blanco',
      isActive: true
    },
    {
      id: '2',
      model: 'Chevrolet Spark',
      plate: 'XYZ-789',
      year: 2019,
      color: 'Rojo',
      isActive: false
    }
  ]);

  // Estado para el modal de agregar vehículo
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    plate: '',
    year: '',
    color: ''
  });

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Función en desarrollo');
  };

  const handleNotifications = () => {
    Alert.alert('Notificaciones', 'Configurar notificaciones');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacidad', 'Configuración de privacidad');
  };

  const handleHelp = () => {
    Alert.alert('Ayuda', 'Centro de ayuda y soporte');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive' }
      ]
    );
  };

  // Función para seleccionar vehículo activo
  const handleSelectVehicle = (vehicleId: string) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => ({
        ...vehicle,
        isActive: vehicle.id === vehicleId
      }))
    );
    Alert.alert('Vehículo Seleccionado', 'El vehículo ha sido seleccionado como activo');
  };

  // Función para agregar nuevo vehículo
  const handleAddVehicle = () => {
    if (!newVehicle.model || !newVehicle.plate || !newVehicle.year || !newVehicle.color) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      model: newVehicle.model,
      plate: newVehicle.plate.toUpperCase(),
      year: parseInt(newVehicle.year),
      color: newVehicle.color,
      isActive: vehicles.length === 0 // Si es el primer vehículo, hacerlo activo
    };

    setVehicles(prevVehicles => [...prevVehicles, vehicle]);
    setNewVehicle({ model: '', plate: '', year: '', color: '' });
    setShowAddVehicleModal(false);
    Alert.alert('Éxito', 'Vehículo agregado correctamente');
  };

  // Función para eliminar vehículo
  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicleToDelete = vehicles.find(v => v.id === vehicleId);
    
    Alert.alert(
      'Eliminar Vehículo',
      `¿Estás seguro que deseas eliminar ${vehicleToDelete?.model} (${vehicleToDelete?.plate})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
            
            // Si eliminamos el vehículo activo y hay otros vehículos, activar el primero
            if (vehicleToDelete?.isActive && updatedVehicles.length > 0) {
              updatedVehicles[0].isActive = true;
            }
            
            setVehicles(updatedVehicles);
            Alert.alert('Eliminado', 'Vehículo eliminado correctamente');
          }
        }
      ]
    );
  };

  // Obtener vehículo activo
  const activeVehicle = vehicles.find(vehicle => vehicle.isActive);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#6b7280" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Gerson Pereira</Text>
              <Text style={styles.userEmail}>gerson@example.com</Text>
              <Text style={styles.userPhone}>+57 300 123 4567</Text>
            </View>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={20} color="#22c55e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Vehículos ({vehicles.length})</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowAddVehicleModal(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No tienes vehículos registrados</Text>
              <Text style={styles.emptyStateSubtext}>Agrega tu primer vehículo para comenzar</Text>
            </View>
          ) : (
            vehicles.map((vehicle) => (
              <View key={vehicle.id} style={[styles.vehicleCard, vehicle.isActive && styles.activeVehicleCard]}>
                <View style={[styles.vehicleIcon, vehicle.isActive && styles.activeVehicleIcon]}>
                  <Ionicons name="car" size={24} color={vehicle.isActive ? "#ffffff" : "#22c55e"} />
                </View>
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleModel}>{vehicle.model} {vehicle.year}</Text>
                    {vehicle.isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                  <Text style={styles.vehicleColor}>{vehicle.color}</Text>
                </View>
                <View style={styles.vehicleActions}>
                  {!vehicle.isActive && (
                    <TouchableOpacity 
                      style={styles.selectButton}
                      onPress={() => handleSelectVehicle(vehicle.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Stats */}
        {activeVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas - {activeVehicle.model}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="speedometer" size={24} color="#3b82f6" />
                <Text style={styles.statNumber}>15,420</Text>
                <Text style={styles.statLabel}>Km recorridos</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#f59e0b" />
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Días sin multas</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="leaf" size={24} color="#22c55e" />
                <Text style={styles.statNumber}>8.5</Text>
                <Text style={styles.statLabel}>L/100km promedio</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications" size={20} color="#6366f1" />
            </View>
            <Text style={styles.menuText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
            <View style={styles.menuIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            </View>
            <Text style={styles.menuText}>Privacidad y Seguridad</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.menuText}>Ayuda y Soporte</Text>
            <Text style={styles.versionText}>v1.0.0</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para agregar vehículo */}
      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddVehicleModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Agregar Vehículo</Text>
            <TouchableOpacity onPress={handleAddVehicle}>
              <Text style={styles.modalSaveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Modelo del Vehículo</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Toyota Corolla"
                value={newVehicle.model}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, model: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Placa</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: ABC-123"
                value={newVehicle.plate}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, plate: text }))}
                autoCapitalize="characters"
                maxLength={7}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Año</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: 2020"
                value={newVehicle.year}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, year: text }))}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Blanco"
                value={newVehicle.color}
                onChangeText={(text) => setNewVehicle(prev => ({ ...prev, color: text }))}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  userCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  logoutSection: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
   sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#22c55e',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  activeVehicleCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  activeVehicleIcon: {
    backgroundColor: '#22c55e',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  vehicleColor: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
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
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  // ... rest of existing styles ...
});

export default ProfileScreen;