import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DistanceRequest {
  user_lat: number;
  user_lng: number;
  radius_km?: number;
  service_id?: string;
  vehicle_type_id?: string;
  limit?: number;
}

interface Provider {
  id: string;
  business_name: string;
  latitude: number;
  longitude: number;
  rating: number;
  total_reviews: number;
  services: any[];
  distance_km?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

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
    const requestData: DistanceRequest = await req.json();

    // Validate required fields
    if (!requestData.user_lat || !requestData.user_lng) {
      return new Response(
        JSON.stringify({ error: 'User latitude and longitude are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const {
      user_lat,
      user_lng,
      radius_km = 50, // Default 50km radius
      service_id,
      vehicle_type_id,
      limit = 20
    } = requestData;

    // Build query for service providers
    let query = supabase
      .from('service_providers')
      .select(`
        id,
        business_name,
        latitude,
        longitude,
        rating,
        total_reviews,
        is_active,
        provider_services!inner(
          service_id,
          price,
          estimated_duration,
          services(
            id,
            name,
            description,
            vehicle_type_id
          )
        )
      `)
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Filter by service if provided
    if (service_id) {
      query = query.eq('provider_services.service_id', service_id);
    }

    // Filter by vehicle type if provided
    if (vehicle_type_id) {
      query = query.eq('provider_services.services.vehicle_type_id', vehicle_type_id);
    }

    const { data: providers, error } = await query.limit(100); // Get more than needed for distance filtering

    if (error) {
      console.error('Error fetching providers:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch service providers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ 
          providers: [], 
          total: 0,
          message: 'No service providers found in the area'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate distances and filter by radius
    const providersWithDistance: Provider[] = providers
      .map(provider => {
        const distance = calculateDistance(
          user_lat,
          user_lng,
          provider.latitude,
          provider.longitude
        );

        return {
          ...provider,
          distance_km: distance,
          services: provider.provider_services.map((ps: any) => ({
            ...ps.services,
            price: ps.price,
            estimated_duration: ps.estimated_duration
          }))
        };
      })
      .filter(provider => provider.distance_km! <= radius_km)
      .sort((a, b) => a.distance_km! - b.distance_km!) // Sort by distance
      .slice(0, limit); // Limit results

    // Calculate some statistics
    const stats = {
      total_providers: providersWithDistance.length,
      average_distance: providersWithDistance.length > 0 
        ? Math.round((providersWithDistance.reduce((sum, p) => sum + p.distance_km!, 0) / providersWithDistance.length) * 100) / 100
        : 0,
      closest_distance: providersWithDistance.length > 0 ? providersWithDistance[0].distance_km : null,
      furthest_distance: providersWithDistance.length > 0 
        ? providersWithDistance[providersWithDistance.length - 1].distance_km 
        : null,
      search_radius_km: radius_km,
      user_location: {
        latitude: user_lat,
        longitude: user_lng
      }
    };

    // Clean up the response data
    const cleanProviders = providersWithDistance.map(provider => {
      const { provider_services, ...cleanProvider } = provider;
      return cleanProvider;
    });

    return new Response(
      JSON.stringify({ 
        providers: cleanProviders,
        stats,
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in calculate-distance function:', error);
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

1. Find all providers within 10km:
POST /functions/v1/calculate-distance
{
  "user_lat": -34.6037,
  "user_lng": -58.3816,
  "radius_km": 10
}

2. Find providers for specific service:
POST /functions/v1/calculate-distance
{
  "user_lat": -34.6037,
  "user_lng": -58.3816,
  "radius_km": 25,
  "service_id": "uuid-here",
  "limit": 10
}

3. Find providers for specific vehicle type:
POST /functions/v1/calculate-distance
{
  "user_lat": -34.6037,
  "user_lng": -58.3816,
  "radius_km": 15,
  "vehicle_type_id": "uuid-here",
  "limit": 5
}

Response format:
{
  "providers": [
    {
      "id": "uuid",
      "business_name": "Taller Mecánico ABC",
      "latitude": -34.6037,
      "longitude": -58.3816,
      "rating": 4.5,
      "total_reviews": 23,
      "distance_km": 2.34,
      "services": [
        {
          "id": "uuid",
          "name": "Cambio de aceite",
          "price": 5000,
          "estimated_duration": 30
        }
      ]
    }
  ],
  "stats": {
    "total_providers": 5,
    "average_distance": 8.45,
    "closest_distance": 2.34,
    "furthest_distance": 15.67,
    "search_radius_km": 25,
    "user_location": {
      "latitude": -34.6037,
      "longitude": -58.3816
    }
  },
  "success": true
}
*/