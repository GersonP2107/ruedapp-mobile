import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              <Text style={styles.titleGreen}>Rued</Text>
              <Text style={styles.titleBlack}>App</Text>
            </Text>
          </View>
          
          <Text style={styles.greeting}>Buenos días</Text>
          <Text style={styles.userName}>Gerson Pereira!</Text>
          
          {/* Acciones Rápidas - Categorías */}
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <TouchableOpacity style={[styles.categoryButton, styles.categoryButtonActive]}>
              <Text style={styles.categoryTextActive}>Documentos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Pico y Placa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Mantenimiento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Combustible</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Recordatorios</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Estado General */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado General</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, styles.statusIconGreen]}>
                <Ionicons name="car-outline" size={24} color="#22c55e" />
              </View>
              <Text style={styles.statusLabel}>SOAT</Text>
              <Text style={styles.statusValueGreen}>Vigente</Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, styles.statusIconGreen]}>
                <Ionicons name="document-text-outline" size={24} color="#22c55e" />
              </View>
              <Text style={styles.statusLabel}>Técnico</Text>
              <Text style={styles.statusValueGreen}>Vigente</Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, styles.statusIconBlue]}>
                <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statusLabel}>Pico y placa</Text>
              <Text style={styles.statusValueBlue}>Vigente</Text>
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
              <Text style={styles.serviceStatusGreen}>3 vigentes</Text>
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

        {/* Actividad Reciente */}
        <View style={styles.sectionLast}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={[styles.activityIcon, styles.activityIconAmber]}>
                <Ionicons name="speedometer-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Tanqueada registrada</Text>
                <Text style={styles.activitySubtitle}>Hace 2 días</Text>
              </View>
              <Text style={styles.activityTime}>14:30</Text>
            </View>
          </View>
          
          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={[styles.activityIcon, styles.activityIconIndigo]}>
                <Ionicons name="document-text-outline" size={20} color="#6366f1" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Documento renovado</Text>
                <Text style={styles.activitySubtitle}>Hace 5 días</Text>
              </View>
              <Text style={styles.activityTime}>12:50</Text>
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
  },
  title: {
    fontSize: 24,
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
    marginTop: 24,
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
    marginHorizontal: 24,
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
    marginHorizontal: 24,
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