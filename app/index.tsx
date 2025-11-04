import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/infrastructure/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const { user, isLoading, vehicles } = useAuth();
  const [firstLaunchChecked, setFirstLaunchChecked] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('onboarding_completed');
        if (mounted) {
          setShouldShowOnboarding(seen !== 'true');
        }
      } finally {
        if (mounted) setFirstLaunchChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (isLoading || !firstLaunchChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (shouldShowOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (user) {
    // Si el usuario está autenticado pero no tiene vehículos, redirigir a registro de vehículo
    if (vehicles.length === 0) {
      return <Redirect href="/vehicle-registration" />;
    }
    // Si tiene vehículos, redirigir a la app principal
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <Redirect href="/welcome" />;
}