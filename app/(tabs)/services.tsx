import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ServicesScreen = () => {
  const { user, vehicles, activeVehicle, isLoading, fetchUserVehicles, setActiveVehicle } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    if (!vehicles || vehicles.length === 0) {
      setLoadingVehicles(true);
      try {
        await fetchUserVehicles();
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoadingVehicles(false);
      }
    }
  };

  // Servicios personalizados según el tipo de vehículo
  const getPersonalizedServices = () => {
    const baseServices = [
      {
        id: 1,
        title: 'Cambio de Aceite',
        description: activeVehicle ? `Mantenimiento para ${activeVehicle.vehicle_type.name}` : 'Mantenimiento preventivo del motor',
        price: activeVehicle?.vehicle_type.name === 'Motocicleta' ? 'Desde $40.000' : 'Desde $80.000',
        icon: 'car-outline',
        category: 'maintenance',
        urgent: false,
        vehicleTypes: ['all']
      },
      {
        id: 2,
        title: 'Revisión Técnico-Mecánica',
        description: 'Certificación obligatoria anual',
        price: activeVehicle?.vehicle_type.name === 'Motocicleta' ? 'Desde $80.000' : 'Desde $120.000',
        icon: 'checkmark-circle-outline',
        category: 'legal',
        urgent: true,
        vehicleTypes: ['all']
      },
      {
        id: 3,
        title: 'Alineación y Balanceo',
        description: 'Optimiza el rendimiento de las llantas',
        price: 'Desde $60.000',
        icon: 'settings-outline',
        category: 'maintenance',
        urgent: false,
        vehicleTypes: ['Automóvil', 'Camioneta']
      },
      {
        id: 4,
        title: 'Lavado Completo',
        description: activeVehicle ? `Lavado especializado para ${activeVehicle.vehicle_type.name}` : 'Lavado exterior e interior',
        price: activeVehicle?.vehicle_type.name === 'Motocicleta' ? 'Desde $15.000' : 'Desde $25.000',
        icon: 'water-outline',
        category: 'cleaning',
        urgent: false,
        vehicleTypes: ['all']
      },
      {
        id: 5,
        title: 'Grúa 24/7',
        description: 'Servicio de emergencia',
        price: 'Desde $150.000',
        icon: 'construct-outline',
        category: 'emergency',
        urgent: true,
        vehicleTypes: ['all']
      },
      {
        id: 6,
        title: 'Seguro Vehicular',
        description: 'SOAT y seguros todo riesgo',
        price: 'Cotizar',
        icon: 'shield-checkmark-outline',
        category: 'insurance',
        urgent: false,
        vehicleTypes: ['all']
      },
      {
        id: 7,
        title: 'Mantenimiento de Cadena',
        description: 'Limpieza y lubricación de cadena',
        price: 'Desde $25.000',
        icon: 'link-outline',
        category: 'maintenance',
        urgent: false,
        vehicleTypes: ['Motocicleta']
      }
    ];

    // Filtrar servicios según el tipo de vehículo activo
    if (activeVehicle) {
      return baseServices.filter(service => 
        service.vehicleTypes.includes('all') || 
        service.vehicleTypes.includes(activeVehicle.vehicle_type.name)
      );
    }
    
    return baseServices.filter(service => service.vehicleTypes.includes('all'));
  };

  // Categorías de servicios
  const categories = [
    { id: 'all', name: 'Todos', icon: 'grid-outline' },
    { id: 'maintenance', name: 'Mantenimiento', icon: 'build-outline' },
    { id: 'legal', name: 'Trámites', icon: 'document-text-outline' },
    { id: 'emergency', name: 'Emergencia', icon: 'warning-outline' },
    { id: 'cleaning', name: 'Lavado', icon: 'water-outline' },
    { id: 'insurance', name: 'Seguros', icon: 'shield-outline' }
  ];

  const emergencyServices = [
    {
      title: 'Mecánico a Domicilio',
      description: 'Reparaciones menores en tu ubicación',
      phone: '123-456-7890',
      icon: 'hammer-outline'
    },
    {
      title: 'Cambio de Llanta',
      description: 'Asistencia para cambio de neumático',
      phone: '123-456-7891',
      icon: 'ellipse-outline'
    },
    {
      title: 'Carga de Batería',
      description: 'Servicio de arranque por batería descargada',
      phone: '123-456-7892',
      icon: 'battery-charging-outline'
    }
  ];

  const personalizedServices = getPersonalizedServices();
  const filteredServices = selectedCategory === 'all' 
    ? personalizedServices 
    : personalizedServices.filter(service => service.category === selectedCategory);

  const handleServicePress = (service: any) => {
    const vehicleInfo = activeVehicle ? `\n\nVehículo: ${activeVehicle.brand} ${activeVehicle.model} (${activeVehicle.license_plate})` : '';
    Alert.alert(
      service.title,
      `¿Deseas solicitar el servicio de ${service.title}?${vehicleInfo}\n\nPrecio: ${service.price}\nDescripción: ${service.description}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Solicitar', onPress: () => Alert.alert('Servicio Solicitado', 'Te contactaremos pronto') }
      ]
    );
  };

  const handleVehicleChange = () => {
    if (vehicles && vehicles.length > 1) {
      const vehicleOptions = vehicles.map((vehicle) => ({
        text: `${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`,
        onPress: () => setActiveVehicle(vehicle)
      }));
      
      Alert.alert(
        'Seleccionar Vehículo',
        'Elige el vehículo para el cual deseas ver los servicios:',
        [
          ...vehicleOptions,
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('Sin vehículos', 'No tienes vehículos registrados o solo tienes uno.');
    }
  };

  const handleEmergencyCall = (phone: string, service: string) => {
    Alert.alert(
      'Llamada de Emergencia',
      `¿Deseas llamar al servicio de ${service}?\n\nNúmero: ${phone}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => Alert.alert('Llamando...', `Conectando con ${phone}`) }
      ]
    );
  };

  const handleFindNearby = () => {
    Alert.alert('Buscar Cerca', 'Buscando talleres y servicios cercanos...');
  };

  const handleScheduleService = () => {
    Alert.alert('Agendar Cita', 'Función para agendar servicios');
  };

  if (isLoading || loadingVehicles) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Servicios</Text>
          <Text style={styles.subtitle}>Mantenimiento y asistencia vehicular</Text>
        </View>

        {/* Vehículo Activo */}
        {activeVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehículo Seleccionado</Text>
            <TouchableOpacity style={styles.activeVehicleCard} onPress={handleVehicleChange}>
              <View style={styles.vehicleIcon}>
                <Ionicons 
                  name={activeVehicle.vehicle_type.name === 'Motocicleta' ? 'bicycle-outline' : 'car-outline'} 
                  size={24} 
                  color="#3b82f6" 
                />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>
                  {activeVehicle.brand} {activeVehicle.model}
                </Text>
                <Text style={styles.vehicleSubtitle}>
                  {activeVehicle.license_plate} • {activeVehicle.vehicle_type.name}
                </Text>
              </View>
              <Ionicons name="chevron-down-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        )}

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleFindNearby}>
              <Ionicons name="location-outline" size={24} color="#3b82f6" />
              <Text style={styles.quickActionText}>Buscar Cerca</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleScheduleService}>
              <Ionicons name="calendar-outline" size={24} color="#10b981" />
              <Text style={styles.quickActionText}>Agendar Cita</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategoryCard
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.id ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Servicios Principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Servicios Disponibles {activeVehicle && `para ${activeVehicle.vehicle_type.name}`}
          </Text>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service)}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIcon}>
                  <Ionicons name={service.icon as any} size={24} color="#3b82f6" />
                </View>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceTitleRow}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    {service.urgent && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>Urgente</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Servicios de Emergencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergencias 24/7</Text>
          <View style={styles.emergencyContainer}>
            {emergencyServices.map((emergency, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emergencyCard}
                onPress={() => handleEmergencyCall(emergency.phone, emergency.title)}
              >
                <View style={styles.emergencyIcon}>
                  <Ionicons name={emergency.icon as any} size={20} color="#ef4444" />
                </View>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyTitle}>{emergency.title}</Text>
                  <Text style={styles.emergencyDescription}>{emergency.description}</Text>
                </View>
                <Ionicons name="call-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Información Importante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Importante</Text>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Horarios de Atención</Text>
              <Text style={styles.infoText}>
                • Lunes a Viernes: 7:00 AM - 6:00 PM{"\n"}
                • Sábados: 8:00 AM - 4:00 PM{"\n"}
                • Domingos: Solo emergencias{"\n"}
                • Servicios 24/7: Grúa y asistencia vial
              </Text>
            </View>
          </View>
        </View>

        {/* Consejos personalizados */}
        <View style={styles.section}>
          <View style={styles.tipsCard}>
            <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>
                Consejos de Mantenimiento {activeVehicle && `para ${activeVehicle.vehicle_type.name}`}
              </Text>
              <Text style={styles.tipsText}>
                {activeVehicle?.vehicle_type.name === 'Motocicleta' ? (
                  "• Cambia el aceite cada 3,000-5,000 km\n• Revisa la tensión de la cadena semanalmente\n• Verifica la presión de llantas antes de cada viaje\n• Mantén al día la revisión técnico-mecánica"
                ) : (
                  "• Cambia el aceite cada 5,000-10,000 km\n• Revisa la presión de llantas mensualmente\n• Programa la revisión técnico-mecánica con anticipación\n• Mantén al día los documentos del vehículo"
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
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
  selectedCategoryCard: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  urgentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  emergencyContainer: {
    gap: 8,
  },
  emergencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 40,
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  // Estilos faltantes:
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  activeVehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default ServicesScreen;