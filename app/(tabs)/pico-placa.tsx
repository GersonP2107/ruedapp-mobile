import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definir tipos para TypeScript
type DayName = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

type PicoPlacaRestriction = {
  digits: number[];
  hours: string;
};

type PicoPlacaSchedule = {
  [key in DayName]: PicoPlacaRestriction;
};

// Interfaz para vehículos (debe coincidir con profile.tsx)
interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: number;
  color: string;
  isActive: boolean;
}

const PicoPlacaScreen = () => {
  const [currentDay, setCurrentDay] = useState<DayName>('Lunes'); // Inicializar con un valor válido
  const [currentDate, setCurrentDate] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  
  // Simulación de vehículos (en una app real, esto vendría de un contexto global o AsyncStorage)
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
  
  // Configuración de Pico y Placa para Bogotá con tipado correcto
  const picoPlacaSchedule: PicoPlacaSchedule = {
    'Lunes': { digits: [0, 1], hours: '6:00 AM - 9:00 AM, 3:00 PM - 7:30 PM' },
    'Martes': { digits: [2, 3], hours: '6:00 AM - 9:00 AM, 3:00 PM - 7:30 PM' },
    'Miércoles': { digits: [4, 5], hours: '6:00 AM - 9:00 AM, 3:00 PM - 7:30 PM' },
    'Jueves': { digits: [6, 7], hours: '6:00 AM - 9:00 AM, 3:00 PM - 7:30 PM' },
    'Viernes': { digits: [8, 9], hours: '6:00 AM - 9:00 AM, 3:00 PM - 7:30 PM' },
    'Sábado': { digits: [], hours: 'Sin restricción' },
    'Domingo': { digits: [], hours: 'Sin restricción' }
  };

  const dayNames: DayName[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  useEffect(() => {
    const today = new Date();
    const dayName = dayNames[today.getDay()];
    const dateString = `${today.getDate()} de ${monthNames[today.getMonth()]} de ${today.getFullYear()}`;
    
    setCurrentDay(dayName);
    setCurrentDate(dateString);
    
    // Verificar si la placa del vehículo activo está restringida hoy
    const activeVehicle = vehicles.find(v => v.isActive);
    if (activeVehicle?.plate) {
      const lastDigit = parseInt(activeVehicle.plate.slice(-1));
      
      if (dayName && picoPlacaSchedule[dayName]) {
        const todayRestriction = picoPlacaSchedule[dayName];
        setIsRestricted(todayRestriction.digits.includes(lastDigit));
      }
    }
  }, [vehicles]); // Update effect when vehicles array changes

  // Función para cambiar vehículo activo
  const handleSelectVehicle = (vehicleId: string) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => ({
        ...vehicle,
        isActive: vehicle.id === vehicleId
      }))
    );
    setShowVehicleSelector(false);
  };

  const handleChangePlate = () => {
    setShowVehicleSelector(true);
  };

  const handleSetReminder = () => {
    Alert.alert('Recordatorio', 'Recordatorio configurado para mañana');
  };

  const handleViewMap = () => {
    Alert.alert('Mapa', 'Ver zonas de restricción en el mapa');
  };

  const getLastDigit = (plate: string) => {
    return plate.slice(-1);
  };

  const getStatusColor = () => {
    return isRestricted ? '#ef4444' : '#22c55e';
  };

  const getStatusText = () => {
    return isRestricted ? 'RESTRINGIDO' : 'LIBRE';
  };

  const getStatusIcon = () => {
    return isRestricted ? 'close-circle' : 'checkmark-circle';
  };

  // Función auxiliar para obtener la restricción del día actual de forma segura
  const getCurrentDayRestriction = () => {
    return currentDay && picoPlacaSchedule[currentDay] ? picoPlacaSchedule[currentDay] : { digits: [], hours: 'Sin restricción' };
  };

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pico y Placa</Text>
        <Text style={styles.subtitle}>Restricciones vehiculares en Bogotá</Text>
        <Text style={styles.dateText}>{currentDate}</Text>
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
        <View style={styles.statusHeader}>
          <View style={styles.plateContainer}>
            <Text style={styles.plateLabel}>Tu vehículo</Text>
            <View style={styles.plateNumber}>
              <Text style={styles.plateText}>{vehicles.find(v => v.isActive)?.plate}</Text>
              <TouchableOpacity onPress={handleChangePlate}>
                <Ionicons name="pencil" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statusIndicator}>
            <Ionicons name={getStatusIcon()} size={48} color={getStatusColor()} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        
        {isRestricted ? (
          <View style={styles.restrictionAlert}>
            <Ionicons name="warning" size={20} color="#ef4444" />
            <Text style={styles.restrictionText}>
              Tu vehículo NO puede circular hoy de {picoPlacaSchedule[currentDay as DayName].hours}
            </Text>
          </View>
        ) : (
          <View style={styles.freeAlert}>
            <Ionicons name="checkmark" size={20} color="#22c55e" />
            <Text style={styles.freeText}>
              ¡Tu vehículo puede circular libremente hoy!
            </Text>
          </View>
        )}
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restricción de Hoy - {currentDay}</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="calendar" size={24} color="#6366f1" />
            <Text style={styles.scheduleDay}>{currentDay}</Text>
          </View>
          
          <View style={styles.scheduleDetails}>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Últimos dígitos:</Text>
              <View style={styles.digitsContainer}>
                {getCurrentDayRestriction().digits.length > 0 ? (
                  getCurrentDayRestriction().digits.map((digit, index) => (
                    <View key={index} style={styles.digitBadge}>
                      <Text style={styles.digitText}>{digit}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRestrictionText}>Sin restricción</Text>
                )}
              </View>
            </View>
            
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Horarios:</Text>
              <Text style={styles.scheduleHours}>{getCurrentDayRestriction().hours}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Weekly Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horario Semanal</Text>
        
        {Object.entries(picoPlacaSchedule).map(([day, schedule]) => (
          <View key={day} style={[styles.weeklyCard, day === currentDay && styles.currentDayCard]}>
            <View style={styles.weeklyHeader}>
              <Text style={[styles.weeklyDay, day === currentDay && styles.currentDayText]}>
                {day}
              </Text>
              {day === currentDay && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>HOY</Text>
                </View>
              )}
            </View>
            
            <View style={styles.weeklyDetails}>
              <View style={styles.weeklyDigits}>
                {schedule.digits.length > 0 ? (
                  schedule.digits.map((digit, index) => (
                    <View key={index} style={styles.weeklyDigitBadge}>
                      <Text style={styles.weeklyDigitText}>{digit}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.weeklyNoRestriction}>Libre</Text>
                )}
              </View>
              <Text style={styles.weeklyHours}>{schedule.hours}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={handleSetReminder}>
            <Ionicons name="notifications" size={24} color="#f59e0b" />
            <Text style={styles.actionTitle}>Recordatorio</Text>
            <Text style={styles.actionSubtitle}>Notificación diaria</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleViewMap}>
            <Ionicons name="map" size={24} color="#3b82f6" />
            <Text style={styles.actionTitle}>Mapa</Text>
            <Text style={styles.actionSubtitle}>Zonas de restricción</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="car" size={24} color="#10b981" />
            <Text style={styles.actionTitle}>Alternativas</Text>
            <Text style={styles.actionSubtitle}>Transporte público</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#6366f1" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Información Importante</Text>
            <Text style={styles.infoText}>
              • El Pico y Placa aplica de lunes a viernes{"\n"}
              • Horarios: 6:00 AM - 9:00 AM y 3:00 PM - 7:30 PM{"\n"}
              • No aplica en días festivos{"\n"}
              • Multa por incumplimiento: $438.900 (2024)
            </Text>
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.emergencySection}>
        <TouchableOpacity style={styles.emergencyCard}>
          <Ionicons name="call" size={20} color="#ef4444" />
          <Text style={styles.emergencyText}>Línea de Atención: 195</Text>
          <Ionicons name="chevron-forward" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plateContainer: {
    flex: 1,
  },
  plateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  plateNumber: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  restrictionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  restrictionText: {
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
  freeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 14,
    color: '#16a34a',
    marginLeft: 8,
    flex: 1,
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
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleDay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  scheduleDetails: {
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  digitsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  digitBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  digitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noRestrictionText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  scheduleHours: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  weeklyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
  currentDayCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  currentDayText: {
    color: '#3b82f6',
  },
  todayBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  weeklyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyDigits: {
    flexDirection: 'row',
    gap: 4,
  },
  weeklyDigitBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  weeklyDigitText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  weeklyNoRestriction: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  weeklyHours: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  infoSection: {
    marginHorizontal: 24,
    marginBottom: 24,
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
  emergencySection: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 12,
  },vehicleInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
  vehicleList: {
    flex: 1,
    padding: 20,
  },
  vehicleOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeVehicleOption: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  vehicleOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleOptionInfo: {
    flex: 1,
  },
  vehicleOptionModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  vehicleOptionPlate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  vehicleOptionColor: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  activeText: {
    color: '#22c55e',
  },
  // ... rest of existing styles ...
});

export default PicoPlacaScreen;
