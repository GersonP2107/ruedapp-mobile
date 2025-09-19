import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Usuario autenticado, ir a tabs
        router.replace('/(tabs)');
      } else {
        // Usuario no autenticado, ir a welcome
        router.replace('/welcome');
      }
    }
  }, [user, isLoading]);

  // Mostrar loading mientras se verifica la autenticación
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}