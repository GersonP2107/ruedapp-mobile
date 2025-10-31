import * as Notifications from 'expo-notifications';
import { supabase } from '../../../lib/supabase';

// Configure global notification handler (only once, imported in app entry)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePushToken(userId?: string | null) {
  // Check permission
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  // On Android 13+ and iOS, request if not granted
  if (finalStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== 'granted') return null;

  // Get Expo push token
  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;

    // Persist to profile if user is logged in
    if (userId) {
      try {
        await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
      } catch (e) {
        console.warn('Failed to persist expo push token:', (e as any)?.message);
      }
    }
    return token;
  } catch (e) {
    console.warn('Failed to get Expo push token:', (e as any)?.message);
    return null;
  }
}