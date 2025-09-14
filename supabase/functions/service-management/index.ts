import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ServiceRequestData {
  user_id: string;
  provider_id: string;
  vehicle_id: string;
  service_id: string;
  scheduled_date?: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface UpdateServiceRequestData {
  service_request_id: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  provider_notes?: string;
  completion_notes?: string;
  actual_amount?: number;
}

interface ServiceAvailabilityData {
  provider_id: string;
  date: string;
  time_slots?: string[];
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

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'create-request':
        return await createServiceRequest(req, supabase);
      
      case 'update-request':
        return await updateServiceRequest(req, supabase);
      
      case 'cancel-request':
        return await cancelServiceRequest(req, supabase);
      
      case 'get-availability':
        return await getProviderAvailability(req, supabase);
      
      case 'calculate-price':
        return await calculateServicePrice(req, supabase);
      
      case 'get-requests':
        return await getServiceRequests(req, supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Error in service-management function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createServiceRequest(
  req: Request,
  supabase: any
): Promise<Response> {
  try {
    const requestData: ServiceRequestData = await req.json();

    // Validate required fields
    if (!requestData.user_id || !requestData.provider_id || !requestData.vehicle_id || !requestData.service_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user owns the vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, user_id')
      .eq('id', requestData.vehicle_id)
      .eq('user_id', requestData.user_id)
      .single();

    if (vehicleError || !vehicle) {
      return new Response(
        JSON.stringify({ error: 'Vehicle not found or unauthorized' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify provider offers the service
    const { data: providerService, error: serviceError } = await supabase
      .from('provider_services')
      .select(`
        id,
        price,
        estimated_duration,
        services(
          id,
          name,
          vehicle_type_id
        )
      `)
      .eq('provider_id', requestData.provider_id)
      .eq('service_id', requestData.service_id)
      .single();

    if (serviceError || !providerService) {
      return new Response(
        JSON.stringify({ error: 'Service not offered by this provider' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify vehicle type compatibility
    const { data: vehicleData } = await supabase
      .from('vehicles')
      .select('vehicle_type_id')
      .eq('id', requestData.vehicle_id)
      .single();

    if (vehicleData && providerService.services.vehicle_type_id && 
        vehicleData.vehicle_type_id !== providerService.services.vehicle_type_id) {
      return new Response(
        JSON.stringify({ error: 'Service not compatible with vehicle type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create service request
    const serviceRequestId = crypto.randomUUID();
    const { data: serviceRequest, error: insertError } = await supabase
      .from('service_requests')
      .insert({
        id: serviceRequestId,
        user_id: requestData.user_id,
        provider_id: requestData.provider_id,
        vehicle_id: requestData.vehicle_id,
        service_id: requestData.service_id,
        status: 'pending',
        estimated_amount: providerService.price,
        total_amount: providerService.price,
        estimated_duration: providerService.estimated_duration,
        scheduled_date: requestData.scheduled_date,
        notes: requestData.notes,
        location_latitude: requestData.location?.latitude,
        location_longitude: requestData.location?.longitude,
        location_address: requestData.location?.address,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating service request:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create service request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send notification to provider (call push-notifications function)
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/push-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: requestData.provider_id,
          title: 'Nueva solicitud de servicio',
          body: `Tienes una nueva solicitud para ${providerService.services.name}`,
          data: {
            type: 'service_request',
            service_request_id: serviceRequestId
          }
        })
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Continue anyway, service request was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        service_request: serviceRequest,
        message: 'Service request created successfully'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating service request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create service request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function updateServiceRequest(
  req: Request,
  supabase: any
): Promise<Response> {
  try {
    const updateData: UpdateServiceRequestData = await req.json();

    if (!updateData.service_request_id) {
      return new Response(
        JSON.stringify({ error: 'Service request ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get current service request
    const { data: currentRequest, error: fetchError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', updateData.service_request_id)
      .single();

    if (fetchError || !currentRequest) {
      return new Response(
        JSON.stringify({ error: 'Service request not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare update object
    const updateObject: any = {
      updated_at: new Date().toISOString()
    };

    if (updateData.status) {
      updateObject.status = updateData.status;
      
      // Set completion date if status is completed
      if (updateData.status === 'completed') {
        updateObject.completed_at = new Date().toISOString();
      }
    }

    if (updateData.provider_notes) {
      updateObject.provider_notes = updateData.provider_notes;
    }

    if (updateData.completion_notes) {
      updateObject.completion_notes = updateData.completion_notes;
    }

    if (updateData.actual_amount) {
      updateObject.total_amount = updateData.actual_amount;
    }

    // Update service request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('service_requests')
      .update(updateObject)
      .eq('id', updateData.service_request_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating service request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update service request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send notification to user about status change
    if (updateData.status && updateData.status !== currentRequest.status) {
      try {
        let notificationTitle = 'Actualización de servicio';
        let notificationBody = `Tu servicio ha sido actualizado a: ${updateData.status}`;

        if (updateData.status === 'confirmed') {
          notificationTitle = 'Servicio confirmado';
          notificationBody = 'Tu solicitud de servicio ha sido confirmada';
        } else if (updateData.status === 'in_progress') {
          notificationTitle = 'Servicio en progreso';
          notificationBody = 'Tu servicio está siendo realizado';
        } else if (updateData.status === 'completed') {
          notificationTitle = 'Servicio completado';
          notificationBody = 'Tu servicio ha sido completado exitosamente';
        }

        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/push-notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: currentRequest.user_id,
            title: notificationTitle,
            body: notificationBody,
            data: {
              type: 'service_update',
              service_request_id: updateData.service_request_id,
              status: updateData.status
            }
          })
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        service_request: updatedRequest,
        message: 'Service request updated successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error updating service request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update service request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function cancelServiceRequest(
  req: Request,
  supabase: any
): Promise<Response> {
  try {
    const { service_request_id, reason } = await req.json();

    if (!service_request_id) {
      return new Response(
        JSON.stringify({ error: 'Service request ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update service request status to cancelled
    const { data: cancelledRequest, error: updateError } = await supabase
      .from('service_requests')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', service_request_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error cancelling service request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to cancel service request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        service_request: cancelledRequest,
        message: 'Service request cancelled successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error cancelling service request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to cancel service request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function getProviderAvailability(
  req: Request,
  supabase: any
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const provider_id = url.searchParams.get('provider_id');
    const date = url.searchParams.get('date');

    if (!provider_id) {
      return new Response(
        JSON.stringify({ error: 'Provider ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get provider's working hours
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('working_hours, is_active')
      .eq('id', provider_id)
      .single();

    if (providerError || !provider || !provider.is_active) {
      return new Response(
        JSON.stringify({ error: 'Provider not found or inactive' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get existing appointments for the date
    let query = supabase
      .from('service_requests')
      .select('scheduled_date, estimated_duration')
      .eq('provider_id', provider_id)
      .in('status', ['confirmed', 'in_progress']);

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query
        .gte('scheduled_date', startDate.toISOString())
        .lt('scheduled_date', endDate.toISOString());
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch availability' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate available time slots
    const workingHours = provider.working_hours || {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '14:00' },
      sunday: null
    };

    return new Response(
      JSON.stringify({
        success: true,
        provider_id,
        date,
        working_hours: workingHours,
        existing_appointments: appointments || [],
        available_slots: calculateAvailableSlots(workingHours, appointments || [], date)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error getting provider availability:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get provider availability' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function calculateServicePrice(
  req: Request,
  supabase: any
): Promise<Response> {
  try {
    const { provider_id, service_id, vehicle_id } = await req.json();

    if (!provider_id || !service_id) {
      return new Response(
        JSON.stringify({ error: 'Provider ID and Service ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get base price from provider service
    const { data: providerService, error: serviceError } = await supabase
      .from('provider_services')
      .select(`
        price,
        estimated_duration,
        services(
          name,
          base_price,
          vehicle_type_id
        )
      `)
      .eq('provider_id', provider_id)
      .eq('service_id', service_id)
      .single();

    if (serviceError || !providerService) {
      return new Response(
        JSON.stringify({ error: 'Service not found for this provider' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let finalPrice = providerService.price;
    let priceBreakdown = {
      base_price: providerService.price,
      vehicle_modifier: 0,
      total: finalPrice
    };

    // Apply vehicle-specific pricing if vehicle_id is provided
    if (vehicle_id) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('vehicle_type_id, year')
        .eq('id', vehicle_id)
        .single();

      if (vehicle) {
        // Apply vehicle type modifier (example: luxury cars +20%, motorcycles -30%)
        const { data: vehicleType } = await supabase
          .from('vehicle_types')
          .select('name, price_modifier')
          .eq('id', vehicle.vehicle_type_id)
          .single();

        if (vehicleType && vehicleType.price_modifier) {
          const modifier = (vehicleType.price_modifier / 100) * providerService.price;
          priceBreakdown.vehicle_modifier = modifier;
          finalPrice += modifier;
        }

        // Apply age modifier (older cars might need more work)
        const currentYear = new Date().getFullYear();
        const vehicleAge = currentYear - vehicle.year;
        if (vehicleAge > 10) {
          const ageModifier = Math.min(vehicleAge - 10, 10) * 0.05 * providerService.price; // 5% per year over 10 years, max 50%
          priceBreakdown.vehicle_modifier += ageModifier;
          finalPrice += ageModifier;
        }
      }
    }

    priceBreakdown.total = Math.round(finalPrice);

    return new Response(
      JSON.stringify({
        success: true,
        service_name: providerService.services.name,
        estimated_duration: providerService.estimated_duration,
        price_breakdown: priceBreakdown,
        final_price: priceBreakdown.total
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error calculating service price:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to calculate service price' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function getServiceRequests(
  req: Request,
  supabase: any
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');
    const provider_id = url.searchParams.get('provider_id');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!user_id && !provider_id) {
      return new Response(
        JSON.stringify({ error: 'Either user_id or provider_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let query = supabase
      .from('service_requests')
      .select(`
        *,
        services(name, description),
        vehicles(make, model, year, license_plate),
        service_providers(business_name, phone, email),
        user_profiles(full_name, phone)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (provider_id) {
      query = query.eq('provider_id', provider_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error('Error fetching service requests:', requestsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch service requests' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        service_requests: requests || [],
        total: requests?.length || 0,
        limit,
        offset
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error getting service requests:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get service requests' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

function calculateAvailableSlots(workingHours: any, appointments: any[], date?: string): string[] {
  if (!date) return [];
  
  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  const dayHours = workingHours[dayName];
  if (!dayHours) return []; // Day off
  
  const slots: string[] = [];
  const startTime = dayHours.start;
  const endTime = dayHours.end;
  
  // Generate 1-hour slots
  let currentTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(`${date}T${endTime}:00`);
  
  while (currentTime < endDateTime) {
    const timeSlot = currentTime.toTimeString().slice(0, 5);
    
    // Check if slot is available (not conflicting with existing appointments)
    const isAvailable = !appointments.some(appointment => {
      if (!appointment.scheduled_date) return false;
      
      const appointmentStart = new Date(appointment.scheduled_date);
      const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.estimated_duration || 60) * 60000);
      
      return currentTime >= appointmentStart && currentTime < appointmentEnd;
    });
    
    if (isAvailable) {
      slots.push(timeSlot);
    }
    
    currentTime.setHours(currentTime.getHours() + 1);
  }
  
  return slots;
}

/* 
Usage examples:

1. Create service request:
POST /functions/v1/service-management/create-request
{
  "user_id": "uuid-here",
  "provider_id": "uuid-here",
  "vehicle_id": "uuid-here",
  "service_id": "uuid-here",
  "scheduled_date": "2024-01-15T10:00:00Z",
  "notes": "Cambio de aceite urgente",
  "location": {
    "latitude": -34.6037,
    "longitude": -58.3816,
    "address": "Av. Corrientes 1234, CABA"
  }
}

2. Update service request:
POST /functions/v1/service-management/update-request
{
  "service_request_id": "uuid-here",
  "status": "confirmed",
  "provider_notes": "Confirmado para mañana a las 10:00"
}

3. Get provider availability:
GET /functions/v1/service-management/get-availability?provider_id=uuid-here&date=2024-01-15

4. Calculate service price:
POST /functions/v1/service-management/calculate-price
{
  "provider_id": "uuid-here",
  "service_id": "uuid-here",
  "vehicle_id": "uuid-here"
}

5. Get service requests:
GET /functions/v1/service-management/get-requests?user_id=uuid-here&status=pending&limit=10
*/