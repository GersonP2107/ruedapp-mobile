import React, { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Alert, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { OnboardingAnalytics } from '../../../infrastructure/services/OnboardingAnalytics';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { ensurePushToken } from '../../../infrastructure/notifications/config';

export default function PermissionsScreen() {
  const [notifStatus, setNotifStatus] = useState<'granted'|'denied'|'undetermined'>('undetermined');
  const [locStatus, setLocStatus] = useState<'granted'|'denied'|'undetermined'>('undetermined');
  const [requesting, setRequesting] = useState<{notif:boolean;loc:boolean}>({notif:false, loc:false});
  const analytics = OnboardingAnalytics.getInstance();
  const { user } = useAuth();

  useEffect(() => {
    analytics.track('permissions_requested', 1, undefined, user?.id);
    checkStatuses();
  }, []);

  const checkStatuses = useCallback(async () => {
    const notif = await Notifications.getPermissionsAsync();
    setNotifStatus(notif.status === 'granted' ? 'granted' : notif.status === 'denied' ? 'denied' : 'undetermined');

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      // Location services disabled globally
      setLocStatus('denied');
    } else {
      const loc = await Location.getForegroundPermissionsAsync();
      setLocStatus(loc.status === 'granted' ? 'granted' : loc.status === 'denied' ? 'denied' : 'undetermined');
    }
  }, []);

  const requestNotifications = async () => {
    if (requesting.notif) return;
    setRequesting((r) => ({...r, notif:true}));
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setNotifStatus(granted ? 'granted' : 'denied');
      analytics.track(granted ? 'permissions_granted' : 'permissions_denied', 1, { type: 'notifications' }, user?.id);
      if (granted) {
        await ensurePushToken(user?.id);
      } else {
        Alert.alert(
          'Permiso de notificaciones',
          'Para recibir recordatorios de SOAT/Tecnomecánica habilita las notificaciones en Ajustes.',
          [
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Error solicitando notificaciones', e?.message ?? 'Intenta nuevamente.');
    } finally {
      setRequesting((r) => ({...r, notif:false}));
    }
  };

  const requestLocation = async () => {
    if (requesting.loc) return;
    setRequesting((r) => ({...r, loc:true}));
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocStatus('denied');
        analytics.track('permissions_denied', 1, { type: 'location', reason: 'services_disabled' }, user?.id);
        Alert.alert(
          'Ubicación desactivada',
          'Activa los servicios de ubicación del sistema para encontrar talleres cercanos.',
          [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cerrar', style: 'cancel' }]
        );
        return;
      }

      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocStatus(granted ? 'granted' : 'denied');
      analytics.track(granted ? 'permissions_granted' : 'permissions_denied', 1, { type: 'location', canAskAgain }, user?.id);
      if (!granted) {
        Alert.alert(
          'Permiso de ubicación',
          'Para localizar talleres cercanos permite el acceso a tu ubicación en Ajustes.',
          [{ text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }, { text: 'Cerrar', style: 'cancel' }]
        );
      }
    } catch (e: any) {
      Alert.alert('Error solicitando ubicación', e?.message ?? 'Intenta nuevamente.');
    } finally {
      setRequesting((r) => ({...r, loc:false}));
    }
  };

  const continueNext = () => {
    router.push('/onboarding/personalization');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Permisos necesarios</Text>
          <Text style={styles.description}>
            Paso 2 de 3. Te pediremos dos permisos para ofrecerte una mejor experiencia:
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notificaciones</Text>
            <Text style={styles.cardDesc}>Recibe recordatorios de SOAT y revisión técnico mecánica, y alertas de Pico y Placa.</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Permitir notificaciones"
              onPress={requestNotifications}
              disabled={requesting.notif}
              style={[styles.button, notifStatus==='granted'&&styles.buttonGranted]}
            >
              <Text style={[styles.buttonText, notifStatus==='granted'&&styles.buttonTextGranted]}>{notifStatus==='granted'?'Permitido':'Permitir'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ubicación</Text>
            <Text style={styles.cardDesc}>Encuentra talleres y asistencia cercana según tu ubicación actual.</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Permitir ubicación"
              onPress={requestLocation}
              disabled={requesting.loc}
              style={[styles.button, locStatus==='granted'&&styles.buttonGranted]}
            >
              <Text style={[styles.buttonText, locStatus==='granted'&&styles.buttonTextGranted]}>{locStatus==='granted'?'Permitido':'Permitir'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Continuar" onPress={continueNext} style={styles.nextButton}>
            <Text style={styles.nextText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 16, color: '#374151', marginBottom: 16 },
  card: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#374151', marginBottom: 10 },
  button: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start', paddingHorizontal: 16 },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonGranted: { backgroundColor: '#d1fae5' },
  buttonTextGranted: { color: '#065f46' },
  bottomBar: { paddingHorizontal: 24, paddingBottom: 16 },
  nextButton: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});