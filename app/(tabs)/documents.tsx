import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

const DocumentsScreen = () => {
  const handleRenewDocument = (docType: string) => {
    Alert.alert('Renovar Documento', `Renovar ${docType}`);
  };

  const handleViewDocument = (docType: string) => {
    Alert.alert('Ver Documento', `Visualizar ${docType}`);
  };

  const handleAddDocument = () => {
    Alert.alert('Agregar Documento', 'Función para agregar nuevo documento');
  };

  const handleNotifications = () => {
    Alert.alert('Notificaciones', 'Configurar recordatorios de vencimiento');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Documentos</Text>
          <Text style={styles.subtitle}>Gestiona tus documentos vehiculares</Text>
          
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
            <Ionicons name="notifications" size={20} color="#22c55e" />
            <Text style={styles.notificationText}>Recordatorios</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Status Overview */}
        <View style={styles.statusOverview}>
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            </View>
            <Text style={styles.statusNumber}>2</Text>
            <Text style={styles.statusLabel}>Vigentes</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="warning" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statusNumber}>1</Text>
            <Text style={styles.statusLabel}>Por vencer</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="time" size={24} color="#6b7280" />
            </View>
            <Text style={styles.statusNumber}>15</Text>
            <Text style={styles.statusLabel}>Días restantes</Text>
          </View>
        </View>

        {/* Documents List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Documentos</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddDocument}>
              <Ionicons name="add" size={20} color="#22c55e" />
            </TouchableOpacity>
          </View>

          {/* SOAT */}
          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>SOAT</Text>
                <Text style={styles.documentSubtitle}>Seguro Obligatorio</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Vigente</Text>
              </View>
            </View>
            
            <View style={styles.documentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Aseguradora:</Text>
                <Text style={styles.detailValue}>Seguros Bolívar</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vencimiento:</Text>
                <Text style={styles.detailValue}>15 Feb 2025</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Póliza:</Text>
                <Text style={styles.detailValue}>SOA-123456789</Text>
              </View>
            </View>
            
            <View style={styles.documentActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleViewDocument('SOAT')}
              >
                <Ionicons name="eye" size={16} color="#6366f1" />
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.renewButton]} 
                onPress={() => handleRenewDocument('SOAT')}
              >
                <Ionicons name="refresh" size={16} color="#22c55e" />
                <Text style={[styles.actionButtonText, styles.renewButtonText]}>Renovar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Licencia de Conducción */}
          <View style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentIconContainer}>
                <Ionicons name="card" size={24} color="#3b82f6" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Licencia de Conducción</Text>
                <Text style={styles.documentSubtitle}>Categoría B1</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Vigente</Text>
              </View>
            </View>
            
            <View style={styles.documentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Número:</Text>
                <Text style={styles.detailValue}>12345678901</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vencimiento:</Text>
                <Text style={styles.detailValue}>20 Mar 2026</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expedida en:</Text>
                <Text style={styles.detailValue}>Bogotá D.C.</Text>
              </View>
            </View>
            
            <View style={styles.documentActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleViewDocument('Licencia')}
              >
                <Ionicons name="eye" size={16} color="#6366f1" />
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.renewButton]} 
                onPress={() => handleRenewDocument('Licencia')}
              >
                <Ionicons name="refresh" size={16} color="#22c55e" />
                <Text style={[styles.actionButtonText, styles.renewButtonText]}>Renovar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Revisión Técnico Mecánica */}
          <View style={[styles.documentCard, styles.warningCard]}>
            <View style={styles.documentHeader}>
              <View style={[styles.documentIconContainer, styles.warningIconContainer]}>
                <Ionicons name="construct" size={24} color="#f59e0b" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Revisión Técnico Mecánica</Text>
                <Text style={styles.documentSubtitle}>RTM y Emisiones</Text>
              </View>
              <View style={[styles.statusBadge, styles.warningBadge]}>
                <Text style={[styles.statusBadgeText, styles.warningBadgeText]}>Por vencer</Text>
              </View>
            </View>
            
            <View style={styles.documentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Centro:</Text>
                <Text style={styles.detailValue}>CDA Bogotá Norte</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vencimiento:</Text>
                <Text style={[styles.detailValue, styles.warningText]}>28 Ene 2025</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Certificado:</Text>
                <Text style={styles.detailValue}>RTM-987654321</Text>
              </View>
            </View>
            
            <View style={styles.warningAlert}>
              <Ionicons name="warning" size={16} color="#f59e0b" />
              <Text style={styles.warningAlertText}>Vence en 15 días. ¡Programa tu cita!</Text>
            </View>
            
            <View style={styles.documentActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleViewDocument('Técnico Mecánica')}
              >
                <Ionicons name="eye" size={16} color="#6366f1" />
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.urgentButton]} 
                onPress={() => handleRenewDocument('Técnico Mecánica')}
              >
                <Ionicons name="calendar" size={16} color="#ffffff" />
                <Text style={[styles.actionButtonText, styles.urgentButtonText]}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="download" size={24} color="#6366f1" />
              <Text style={styles.quickActionText}>Descargar todos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="share" size={24} color="#10b981" />
              <Text style={styles.quickActionText}>Compartir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="cloud-upload" size={24} color="#f59e0b" />
              <Text style={styles.quickActionText}>Respaldar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Consejo</Text>
              <Text style={styles.tipText}>
                Configura recordatorios para renovar tus documentos con 30 días de anticipación.
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
    marginBottom: 16,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  notificationText: {
    color: '#22c55e',
    fontWeight: '500',
    marginLeft: 6,
  },
  statusOverview: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statusCard: {
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
  statusIconContainer: {
    marginBottom: 8,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  warningIconContainer: {
    backgroundColor: '#fffbeb',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
  warningBadge: {
    backgroundColor: '#fffbeb',
  },
  warningBadgeText: {
    color: '#f59e0b',
  },
  documentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  warningText: {
    color: '#f59e0b',
  },
  warningAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningAlertText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 6,
  },
  renewButton: {
    backgroundColor: '#f0fdf4',
  },
  renewButtonText: {
    color: '#22c55e',
  },
  urgentButton: {
    backgroundColor: '#f59e0b',
  },
  urgentButtonText: {
    color: '#ffffff',
  },
  quickActionsContainer: {
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
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  tipsSection: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  tipCard: {
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
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default DocumentsScreen;