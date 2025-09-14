import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationRequest {
  user_id?: string;
  expo_push_token?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const notificationData: NotificationRequest = await req.json();

    // Validate required fields
    if (!notificationData.title || !notificationData.body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let expoPushTokens: string[] = [];

    // Get push tokens based on user_id or use provided token
    if (notificationData.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('id', notificationData.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (profile?.expo_push_token) {
        expoPushTokens.push(profile.expo_push_token);
      }
    } else if (notificationData.expo_push_token) {
      expoPushTokens.push(notificationData.expo_push_token);
    }

    if (expoPushTokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No push tokens found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare Expo push messages
    const messages: ExpoMessage[] = expoPushTokens.map(token => ({
      to: token,
      title: notificationData.title,
      body: notificationData.body,
      data: notificationData.data || {},
      sound: notificationData.sound || 'default',
      badge: notificationData.badge,
      priority: notificationData.priority || 'default',
      ttl: notificationData.ttl || 2419200, // 4 weeks
    }));

    // Send notifications to Expo Push API
    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!expoResponse.ok) {
      const errorText = await expoResponse.text();
      console.error('Expo push API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send push notification' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const expoResult = await expoResponse.json();
    console.log('Expo push result:', expoResult);

    // Log notification in database
    const { error: logError } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.user_id,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data,
        sent_at: new Date().toISOString(),
        expo_response: expoResult,
      });

    if (logError) {
      console.error('Error logging notification:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        expo_result: expoResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in push-notifications function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/* 
Usage examples:

1. Send notification to specific user:
POST /functions/v1/push-notifications
{
  "user_id": "uuid-here",
  "title": "Solicitud aceptada",
  "body": "Tu solicitud de cambio de aceite ha sido aceptada",
  "data": {
    "request_id": "uuid-here",
    "type": "service_request_accepted"
  }
}

2. Send notification to specific token:
POST /functions/v1/push-notifications
{
  "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Servicio completado",
  "body": "Tu servicio ha sido completado exitosamente",
  "data": {
    "request_id": "uuid-here",
    "type": "service_completed"
  },
  "sound": "default",
  "badge": 1
}
*/