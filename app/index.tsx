import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/infrastructure/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (user) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <Redirect href="/welcome" />;
}