import { useAuth } from '@/contexts/AuthContext';
import '@/global.css';
import { useVehicles } from '@/hooks/useSupabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Interfaz para las actividades
interface ActivityItem {
  id: string;
  type: 'trip' | 'payment' | 'rating' | 'document' | 'maintenance' | 'notification';
  title: string;
  subtitle: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  metadata?: {
    amount?: number;
    rating?: number;
    distance?: number;
    location?: string;
  };
}

const HomeScreen = () => {
  const { user, activeVehicle } = useAuth();
  const { vehicles, fetchVehicles } = useVehicles();
  const [greeting, setGreeting] = useState('Buenos días');
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Determinar saludo basado en la hora
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }

    // Cargar datos del usuario
    loadUserData();
    loadRecentActivities();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Los datos del perfil ya están disponibles en user desde AuthContext
      await fetchVehicles();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Aquí conectarías con tu API para obtener actividades reales
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'trip',
          title: 'Viaje completado',
          subtitle: 'Centro → Zona Norte (12.5 km)',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          icon: 'car-outline',
          iconColor: '#22c55e',
          backgroundColor: '#f0fdf4',
          metadata: { distance: 12.5, amount: 15000 }
        },
        {
          id: '2',
          type: 'payment',
          title: 'Pago realizado',
          subtitle: 'Renovación SOAT - $85.000',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          icon: 'card-outline',
          iconColor: '#3b82f6',
          backgroundColor: '#eff6ff',
          metadata: { amount: 85000 }
        },
        {
          id: '3',
          type: 'rating',
          title: 'Calificación recibida',
          subtitle: '⭐⭐⭐⭐⭐ "Excelente servicio"',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          icon: 'star-outline',
          iconColor: '#f59e0b',
          backgroundColor: '#fffbeb',
          metadata: { rating: 5 }
        },
        {
          id: '4',
          type: 'maintenance',
          title: 'Mantenimiento programado',
          subtitle: 'Cambio de aceite en 500 km',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          icon: 'construct-outline',
          iconColor: '#6366f1',
          backgroundColor: '#e0e7ff'
        }
      ];
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  // Calcular estadísticas del usuario
  const totalVehicles = vehicles?.length || 0;
  const documentsStatus = {
    soat: 'Vigente', // Esto debería venir de la API
    tecnico: 'Vigente',
    vigentes: 3
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header personalizado */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image source={require('@/assets/images/logo-ruedapp.png')} style={{ width: 25, height: 25}}/>
            <Text style={[styles.title, styles.titleGreen]}> Rued</Text>
            <Text style={[styles.title, styles.titleBlack]}>App</Text>
          </View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>
            {loading ? 'Cargando...' : (user?.profile?.full_name || user?.fullName || user?.email || 'Usuario')}
          </Text>
        </View>

        {/* Vehículo activo */}
        {activeVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mi Vehículo</Text>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIcon}>
                  <Ionicons name="car" size={24} color="#22c55e" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehiclePlate}>{activeVehicle.license_plate}</Text>
                  <Text style={styles.vehicleDetails}>
                    {activeVehicle.brand} {activeVehicle.model} {activeVehicle.year}
                  </Text>
                  <Text style={styles.vehicleType}>{activeVehicle.vehicle_type.name}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Estado del vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Vehículo</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Documentos y Estado</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, styles.statusIconGreen]}>
                  <Ionicons name="car-outline" size={24} color="#22c55e" />
                </View>
                <Text style={styles.statusLabel}>SOAT</Text>
                <Text style={styles.statusValueGreen}>{documentsStatus.soat}</Text>
              </View>
              
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, styles.statusIconGreen]}>
                  <Ionicons name="document-text-outline" size={24} color="#22c55e" />
                </View>
                <Text style={styles.statusLabel}>Técnico</Text>
                <Text style={styles.statusValueGreen}>{documentsStatus.tecnico}</Text>
              </View>
              
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, styles.statusIconBlue]}>
                  <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.statusLabel}>Pico y placa</Text>
                <Text style={styles.statusValueBlue}>Libre hoy</Text>
              </View>
              
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, styles.statusIconAmber]}>
                  <Ionicons name="speedometer-outline" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.statusLabel}>Gasolina</Text>
                <Text style={styles.statusValueAmber}>70%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resumen personalizado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Resumen</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalVehicles}</Text>
                <Text style={styles.summaryLabel}>Vehículos</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{documentsStatus.vigentes}</Text>
                <Text style={styles.summaryLabel}>Docs. Vigentes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>0</Text>
                <Text style={styles.summaryLabel}>Multas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Próximos Vencimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Vencimientos</Text>
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <View style={styles.warningIcon}>
                <Ionicons name="document-outline" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.warningTitle}>SOAT próximo a vencer</Text>
            </View>
            <Text style={styles.warningSubtitle}>Vence el 15 de febrero, 2026</Text>
            
            <View style={styles.warningFooter}>
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>15 días</Text>
              </View>
              <TouchableOpacity style={styles.warningButton}>
                <Text style={styles.warningButtonText}>Renovar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Servicios Principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios Principales</Text>
          <View style={styles.servicesRow}>
            <TouchableOpacity style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIcon, styles.serviceIconIndigo]}>
                  <Ionicons name="document-text-outline" size={20} color="#6366f1" />
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.serviceTitle}>Documentos</Text>
              <Text style={styles.serviceSubtitle}>SOAT, Licencia y Técnico</Text>
              <Text style={styles.serviceStatusGreen}>{documentsStatus.vigentes} vigentes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIcon, styles.serviceIconGreen]}>
                  <Ionicons name="calendar-outline" size={20} color="#22c55e" />
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.serviceTitle}>Pico y Placa</Text>
              <Text style={styles.serviceSubtitle}>Restricciones diarias</Text>
              <Text style={styles.serviceStatusGreen}>Libre hoy</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.servicesRow}>
            <TouchableOpacity style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIcon, styles.serviceIconIndigo]}>
                  <Ionicons name="construct-outline" size={20} color="#6366f1" />
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.serviceTitle}>Mantenimiento</Text>
              <Text style={styles.serviceSubtitle}>Historial y programación</Text>
              <View style={styles.serviceStatusRow}>
                <Ionicons name="alert-circle" size={14} color="#f59e0b" />
                <Text style={styles.serviceStatusAmber}>En 2.500 Km</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIcon, styles.serviceIconAmber]}>
                  <Ionicons name="speedometer-outline" size={20} color="#f59e0b" />
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.serviceTitle}>Combustible</Text>
              <Text style={styles.serviceSubtitle}>Registros y estadísticas</Text>
              <View style={styles.serviceStatusRow}>
                <Ionicons name="information-circle" size={14} color="#3b82f6" />
                <Text style={styles.serviceStatusBlue}>$5.000 última vez</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actividad Reciente Mejorada */}
        <View style={styles.sectionLast}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver todo</Text>
              <Ionicons name="chevron-forward" size={16} color="#22c55e" />
            </TouchableOpacity>
          </View>
          
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: activity.backgroundColor }]}>
                    <Ionicons name={activity.icon as any} size={20} color={activity.iconColor} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                    {activity.metadata?.amount && (
                      <Text style={styles.activityAmount}>
                        ${activity.metadata.amount.toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.activityTimeContainer}>
                    <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
                    {activity.type === 'trip' && activity.metadata?.distance && (
                      <Text style={styles.activityDistance}>{activity.metadata.distance} km</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No hay actividad reciente</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tus actividades aparecerán aquí cuando comiences a usar la app
              </Text>
            </View>
          )}
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
    width: '100%',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  titleGreen: {
    color: '#22c55e',
  },
  titleBlack: {
    color: '#000000',
  },
  greeting: {
    color: '#6b7280',
    marginTop: 16,
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
    marginRight: 4,
  },
  // Estilos para el vehículo
  vehicleCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  vehicleType: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
    marginTop: 2,
  },
  // Estilos para el resumen
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Estilos existentes
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#22c55e',
  },
  categoryText: {
    color: '#374151',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusIconGreen: {
    backgroundColor: '#f0fdf4',
  },
  statusIconBlue: {
    backgroundColor: '#eff6ff',
  },
  statusIconAmber: {
    backgroundColor: '#fffbeb',
  },
  statusLabel: {
    fontSize: 14,
    color: '#374151',
  },
  statusValueGreen: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  statusValueBlue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusValueAmber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  section: {
    marginHorizontal: 20,
  },
  sectionLast: {
    marginHorizontal: 24,
    marginBottom: 80,
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  warningSubtitle: {
    color: '#4b5563',
    marginLeft: 44,
  },
  warningFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  warningBadge: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  warningBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  warningButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  servicesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIconIndigo: {
    backgroundColor: '#e0e7ff',
  },
  serviceIconGreen: {
    backgroundColor: '#f0fdf4',
  },
  serviceIconAmber: {
    backgroundColor: '#fffbeb',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    color: '#000000',
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  serviceStatusGreen: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
    marginTop: 8,
  },
  serviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  serviceStatusAmber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f59e0b',
    marginLeft: 4,
  },
  serviceStatusBlue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
    marginLeft: 4,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconAmber: {
    backgroundColor: '#fffbeb',
  },
  activityIconIndigo: {
    backgroundColor: '#e0e7ff',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTimeContainer: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
    marginTop: 2,
  },
  activityDistance: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyStateCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 4,
  },
});

export default HomeScreen;