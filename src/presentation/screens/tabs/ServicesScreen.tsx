import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { useVehicles } from '../../hooks';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  user_id: string;
  vehicle_type_id: string;
  is_active: boolean;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  plate: string; // Para compatibilidad
  color: string;
  isActive: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  category: string;
  urgent?: boolean;
  vehicleTypes?: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface EmergencyService {
  title: string;
  description: string;
  phone: string;
  icon: string;
}

const ServicesScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { vehicles, loading } = useVehicles();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  // Establecer el primer vehículo como activo si no hay uno seleccionado
  React.useEffect(() => {
    if (vehicles.length > 0 && !activeVehicle) {
      setActiveVehicle(vehicles[0] as Vehicle);
    }
  }, [vehicles, activeVehicle]);

  const categories: Category[] = [
    { id: 'all', name: 'Todos', icon: 'grid-outline' },
    { id: 'maintenance', name: 'Mantenimiento', icon: 'build-outline' },
    { id: 'documents', name: 'Documentos', icon: 'document-text-outline' },
    { id: 'insurance', name: 'Seguros', icon: 'shield-checkmark-outline' },
    { id: 'emergency', name: 'Emergencia', icon: 'warning-outline' },
  ];

  const allServices: Service[] = [
    {
      id: '1',
      title: 'Cambio de Aceite',
      description: 'Servicio completo de cambio de aceite y filtro',
      price: 'Desde $45.000',
      icon: 'car-outline',
      category: 'maintenance',
      vehicleTypes: ['Automóvil', 'Motocicleta'],
    },
    {
      id: '2',
      title: 'Revisión Técnico Mecánica',
      description: 'Agenda tu cita para la revisión técnico mecánica',
      price: 'Desde $85.000',
      icon: 'checkmark-circle-outline',
      category: 'documents',
      urgent: true,
    },
    {
      id: '3',
      title: 'SOAT',
      description: 'Renovación del Seguro Obligatorio de Accidentes de Tránsito',
      price: 'Desde $180.000',
      icon: 'shield-outline',
      category: 'insurance',
    },
    {
      id: '4',
      title: 'Alineación y Balanceo',
      description: 'Servicio completo de alineación y balanceo de llantas',
      price: 'Desde $65.000',
      icon: 'settings-outline',
      category: 'maintenance',
      vehicleTypes: ['Automóvil'],
    },
    {
      id: '5',
      title: 'Lavado Completo',
      description: 'Lavado exterior e interior de tu vehículo',
      price: 'Desde $25.000',
      icon: 'water-outline',
      category: 'maintenance',
    },
    {
      id: '6',
      title: 'Seguro Todo Riesgo',
      description: 'Cotiza tu seguro todo riesgo con las mejores aseguradoras',
      price: 'Cotización gratuita',
      icon: 'umbrella-outline',
      category: 'insurance',
    },
  ];

  const emergencyServices: EmergencyService[] = [
    {
      title: 'Grúa 24/7',
      description: 'Servicio de grúa las 24 horas',
      phone: '+57 123 456 7890',
      icon: 'car-sport-outline',
    },
    {
      title: 'Mecánico a Domicilio',
      description: 'Asistencia mecánica donde estés',
      phone: '+57 123 456 7891',
      icon: 'build-outline',
    },
    {
      title: 'Asistencia Vial',
      description: 'Ayuda inmediata en carretera',
      phone: '+57 123 456 7892',
      icon: 'help-circle-outline',
    },
  ];

  const getPersonalizedServices = (): Service[] => {
    if (!activeVehicle) return allServices;
    
    // Nota: Como no tenemos vehicle_type.name, usaremos vehicle_type_id o una lógica alternativa
    return allServices.filter(service => 
      !service.vehicleTypes || 
      service.vehicleTypes.length === 0 // Mostrar todos los servicios por ahora
    );
  };

  const filteredServices = selectedCategory === 'all' 
    ? getPersonalizedServices()
    : getPersonalizedServices().filter(service => service.category === selectedCategory);

  const handleServicePress = (service: Service) => {
    Alert.alert(
      service.title,
      `¿Deseas solicitar el servicio de ${service.title}?\n\n${service.description}\n\nPrecio: ${service.price}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Solicitar', onPress: () => handleRequestService(service) },
      ]
    );
  };

  const handleRequestService = (service: Service) => {
    Alert.alert('Servicio Solicitado', `Tu solicitud para ${service.title} ha sido enviada. Te contactaremos pronto.`);
  };

  const handleVehicleChange = () => {
    if (vehicles.length > 1) {
      Alert.alert(
        'Cambiar Vehículo',
        'Selecciona el vehículo para el cual deseas ver los servicios',
        vehicles.map((vehicle) => ({
          text: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
          onPress: () => setActiveVehicle(vehicle as Vehicle),
        }))
      );
    }
  };

  const handleEmergencyCall = (phone: string, serviceName: string) => {
    Alert.alert(
      'Llamar a Emergencia',
      `¿Deseas llamar al servicio de ${serviceName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Llamar', 
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          }
        },
      ]
    );
  };

  const handleFindNearby = () => {
    Alert.alert('Buscar Cerca', 'Esta función estará disponible próximamente.');
  };

  const handleScheduleService = () => {
    Alert.alert('Agendar Cita', 'Esta función estará disponible próximamente.');
  };

  if (loading) {
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
          <Text style={styles.subtitle}>
            Encuentra todo lo que necesitas para tu vehículo
          </Text>
        </View>

        {/* Vehículo Activo */}
        {activeVehicle && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.activeVehicleCard}
              onPress={handleVehicleChange}
            >
              <View style={styles.vehicleIcon}>
                <Ionicons 
                  name="car-outline" 
                  size={24} 
                  color="#3b82f6" 
                />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>
                  {activeVehicle.brand} {activeVehicle.model}
                </Text>
                <Text style={styles.vehicleSubtitle}>
                  {activeVehicle.plate} • Vehículo
                </Text>
              </View>
              {vehicles.length > 1 && (
                <Ionicons name="chevron-down-outline" size={20} color="#9ca3af" />
              )}
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
            Servicios Disponibles {activeVehicle && `para tu vehículo`}
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
                Consejos de Mantenimiento {activeVehicle && `para tu vehículo`}
              </Text>
              <Text style={styles.tipsText}>
                • Cambia el aceite cada 5,000-10,000 km{"\n"}
                • Revisa la presión de llantas mensualmente{"\n"}
                • Programa la revisión técnico-mecánica con anticipación{"\n"}
                • Mantén al día los documentos del vehículo
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