import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnalytics } from '../../../infrastructure/services/OnboardingAnalytics';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { supabase } from '../../../../lib/supabase';

interface Preferences {
  remindersEnabled: boolean;
  city: string;
  darkModePreferred: boolean;
}

export default function PersonalizationScreen() {
  const [prefs, setPrefs] = useState<Preferences>({ remindersEnabled: true, city: '', darkModePreferred: false });
  const [saving, setSaving] = useState(false);
  const analytics = OnboardingAnalytics.getInstance();
  const { user } = useAuth();

  useEffect(() => {
    analytics.track('slide_viewed', 2, { key: 'personalization' }, user?.id);
  }, []);

  const savePrefs = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(prefs));
      analytics.track('preferences_saved', 2, { prefs }, user?.id);

      // If user logged in, try save to profile (non-blocking)
      if (user?.id) {
        try {
          await supabase.from('profiles').update({ preferred_city: prefs.city, reminders_enabled: prefs.remindersEnabled, dark_mode_preferred: prefs.darkModePreferred }).eq('id', user.id);
        } catch (e) {
          // Ignore backend errors in onboarding
          console.warn('Failed to persist preferences in Supabase:', (e as any)?.message);
        }
      }

      // Marcar onboarding como completado
      await AsyncStorage.setItem('onboarding_completed', 'true');

      await analytics.completeSession(true, user?.id);
      router.replace('/welcome');
    } catch (e: any) {
      await analytics.completeSession(false, user?.id);
      Alert.alert('Error', e?.message ?? 'No se pudo guardar tus preferencias.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof Preferences) => {
    setPrefs((p) => ({ ...p, [key]: key === 'darkModePreferred' ? !p.darkModePreferred : !p.remindersEnabled }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Personaliza tu experiencia</Text>
          <Text style={styles.description}>Configura preferencias básicas para comenzar:</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Recordatorios de SOAT/Tecno</Text>
            <Switch accessibilityLabel="Activar recordatorios" value={prefs.remindersEnabled} onValueChange={() => toggle('remindersEnabled')} />
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Ciudad para Pico y Placa</Text>
            <TextInput
              accessibilityLabel="Ciudad preferida"
              placeholder="Ej. Bogotá"
              style={styles.input}
              value={prefs.city}
              onChangeText={(t) => setPrefs((p) => ({ ...p, city: t }))}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tema oscuro</Text>
            <Switch accessibilityLabel="Preferir tema oscuro" value={prefs.darkModePreferred} onValueChange={() => toggle('darkModePreferred')} />
          </View>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Guardar y finalizar" onPress={savePrefs} style={styles.finishButton} disabled={saving}>
            <Text style={styles.finishText}>{saving ? 'Guardando...' : 'Guardar y finalizar'}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  rowColumn: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  label: { fontSize: 16, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8, marginTop: 8 },
  bottomBar: { paddingHorizontal: 24, paddingBottom: 16 },
  finishButton: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  finishText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});