import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { useProfile } from '../../../infrastructure/hooks/useProfile';
import { useVehicles } from '../../../infrastructure/hooks/useVehicles';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, updateProfile } = useProfile();
  const { vehicles: userVehicles, isLoading: vehiclesLoading, error: vehiclesError, fetchVehicles, addVehicle } = useVehicles();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: ''
  });
  
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    plate: '',
    year: '',
    color: ''
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!vehiclesLoading && !vehiclesError && userVehicles.length === 0) {
      const timer = setTimeout(() => {
        Alert.alert(
          'Sin vehículos registrados',
          'No tienes ningún vehículo registrado. Por favor, agrega al menos un vehículo antes de continuar usando la aplicación.',
          [
            {
              text: 'Agregar vehículo',
              onPress: () => setShowAddVehicleModal(true)
            },
            {
              text: 'Más tarde',
              style: 'cancel'
            }
          ]
        );
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [vehiclesLoading, vehiclesError, userVehicles.length]);
  
  useEffect(() => {
    if (userVehicles.length > 0 && !activeVehicleId) {
      setActiveVehicleId(userVehicles[0].id);
    }
  }, [userVehicles, activeVehicleId]);

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(editForm);
      if (result) {
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', result || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || ''
      });
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setActiveVehicleId(vehicleId);
    Alert.alert('Vehículo Seleccionado', 'El vehículo ha sido seleccionado como activo');
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.model || !newVehicle.plate || !newVehicle.year || !newVehicle.color) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const vehicleData = {
        vehicle_type_id: '0174aecb-9400-4f6a-96d1-0925f9b47431', // ID del tipo Automóvil
        license_plate: newVehicle.plate.toUpperCase(),
        brand: 'Genérico',
        model: newVehicle.model,
        year: parseInt(newVehicle.year),
        color: newVehicle.color
      };

      const result = await addVehicle({
        ...vehicleData,
        mileage: 0 // Add required mileage property with default value
      });
      
      if (result) {
        setNewVehicle({ model: '', plate: '', year: '', color: '' });
        setShowAddVehicleModal(false);
        Alert.alert('Éxito', 'Vehículo agregado correctamente');
      } else {
        Alert.alert('Error', result || 'No se pudo agregar el vehículo');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error al agregar vehículo: ' + error.message);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const vehicleToDelete = userVehicles.find((v: { id: string }) => v.id === vehicleId);
    
    Alert.alert(
      'Eliminar Vehículo',
      `¿Estás seguro que deseas eliminar ${vehicleToDelete?.brand} ${vehicleToDelete?.model} (${vehicleToDelete?.license_plate})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Función en desarrollo', 'La eliminación de vehículos se implementará próximamente');
          }
        }
      ]
    );
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

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/welcome' as any);
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Por favor intenta de nuevo.');
            }
          }
        },
      ]
    );
  };

const activeVehicle = userVehicles.find((vehicle: { id: string }) => vehicle.id === activeVehicleId) || userVehicles[0];

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
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={editForm.full_name}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, full_name: text }))}
                    placeholder="Nombre completo"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                    placeholder="Teléfono"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.userName}>
                    {profile?.full_name || user?.fullName || 'Usuario'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {profile?.email || user?.email || 'Sin email'}
                  </Text>
                  <Text style={styles.userPhone}>
                    {profile?.phone || 'Sin teléfono'}
                  </Text>
                </>
              )}
            </View>
            
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Ionicons name="checkmark" size={20} color="#22c55e" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Ionicons name="close" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={20} color="#22c55e" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Vehículos ({userVehicles.length})</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowAddVehicleModal(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {vehiclesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando vehículos...</Text>
            </View>
          ) : vehiclesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar vehículos: {vehiclesError}</Text>
              <TouchableOpacity onPress={fetchVehicles} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : userVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No tienes vehículos registrados</Text>
              <Text style={styles.emptyStateSubtext}>Agrega tu primer vehículo para comenzar</Text>
            </View>
          ) : (
            userVehicles.map((vehicle) => {
              const isActive = vehicle.id === activeVehicleId;
              return (
                <View key={vehicle.id} style={[styles.vehicleCard, isActive && styles.activeVehicleCard]}>
                  <View style={[styles.vehicleIcon, isActive && styles.activeVehicleIcon]}>
                    <Ionicons 
                      name={vehicle.vehicle_type_id === 'Motocicleta' ? 'bicycle' : 'car'} 
                      size={24} 
                      color={isActive ? "#ffffff" : "#22c55e"} 
                    />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <View style={styles.vehicleHeader}>
                      <Text style={styles.vehicleModel}>{vehicle.brand} {vehicle.model} {vehicle.year}</Text>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>ACTIVO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.vehiclePlate}>{vehicle.license_plate}</Text>
                    <Text style={styles.vehicleColor}>{vehicle.color}</Text>
                    {vehicle.vehicle_type_id && (
                      <Text style={styles.vehicleType}>{vehicle.vehicle_type_id}</Text>
                    )}
                  </View>
                  <View style={styles.vehicleActions}>
                    {!isActive && (
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
              );
            })
          )}
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color="#6b7280" />
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editSectionButton}>
                <Ionicons name="pencil" size={16} color="#22c55e" />
              </TouchableOpacity>
            )}
          </View>
          
          {profileLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
          ) : profileError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>Error al cargar el perfil</Text>
              <TouchableOpacity onPress={fetchProfile} style={styles.retryButton}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {isEditing ? (
                <>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Nombre Completo</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editForm.full_name}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, full_name: text }))}
                      placeholder="Ingresa tu nombre completo"
                    />
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editForm.phone}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                      placeholder="Ingresa tu teléfono"
                      keyboardType="phone-pad"
                    />
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editForm.address}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, address: text }))}
                      placeholder="Ingresa tu dirección"
                      multiline
                    />
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ciudad</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editForm.city}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, city: text }))}
                      placeholder="Ingresa tu ciudad"
                    />
                  </View>
                  
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                      <Ionicons name="close" size={20} color="#6b7280" />
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Nombre</Text>
                    <Text style={styles.infoValue}>
                      {profile?.full_name || user?.fullName || 'No especificado'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>
                      {profile?.email || user?.email || 'No especificado'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>
                      {profile?.phone || 'No especificado'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue}>
                      {profile?.address || 'No especificada'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ciudad</Text>
                    <Text style={styles.infoValue}>
                      {profile?.city || 'No especificada'}
                    </Text>
                  </View>
                  
                  {profile?.created_at && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Miembro desde</Text>
                      <Text style={styles.infoValue}>
                        {new Date(profile.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {/* Quick Stats */}
        {activeVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas - {activeVehicle.brand} {activeVehicle.model}</Text>
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
  vehicleCard: {
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
  activeVehicleCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
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
  activeVehicleIcon: {
    backgroundColor: '#22c55e',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
  vehiclePlate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  vehicleColor: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  vehicleType: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
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
  loadingContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
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
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  editInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  editSectionButton: {
    padding: 4,
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
});

export default ProfileScreen;