import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/infrastructure/context/AuthContext';

export default function Index() {
  const { user, isLoading, vehicles } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
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