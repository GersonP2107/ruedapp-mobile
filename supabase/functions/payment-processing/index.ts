import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  service_request_id: string;
  provider_id: string;
  customer_id: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface PaymentConfirmRequest {
  payment_intent_id: string;
  service_request_id: string;
}

interface RefundRequest {
  payment_intent_id: string;
  amount?: number;
  reason?: string;
  service_request_id: string;
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
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'create-payment-intent':
        return await createPaymentIntent(req, stripe, supabase);
      
      case 'confirm-payment':
        return await confirmPayment(req, stripe, supabase);
      
      case 'refund-payment':
        return await refundPayment(req, stripe, supabase);
      
      case 'webhook':
        return await handleWebhook(req, stripe, supabase);
      
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
    console.error('Error in payment-processing function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createPaymentIntent(
  req: Request,
  stripe: Stripe,
  supabase: any
): Promise<Response> {
  try {
    const requestData: PaymentIntentRequest = await req.json();

    // Validate required fields
    if (!requestData.amount || !requestData.service_request_id || !requestData.provider_id || !requestData.customer_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const {
      amount,
      currency = 'ars', // Default to Argentine Peso
      service_request_id,
      provider_id,
      customer_id,
      description,
      metadata = {}
    } = requestData;

    // Verify service request exists and belongs to customer
    const { data: serviceRequest, error: serviceError } = await supabase
      .from('service_requests')
      .select('id, user_id, provider_id, total_amount, status')
      .eq('id', service_request_id)
      .eq('user_id', customer_id)
      .eq('provider_id', provider_id)
      .single();

    if (serviceError || !serviceRequest) {
      return new Response(
        JSON.stringify({ error: 'Service request not found or unauthorized' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify amount matches service request
    if (Math.abs(serviceRequest.total_amount - amount) > 1) { // Allow 1 peso difference for rounding
      return new Response(
        JSON.stringify({ error: 'Amount mismatch with service request' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get customer information
    const { data: customer } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('user_id', customer_id)
      .single();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || `Pago por servicio - ${serviceRequest.id}`,
      metadata: {
        service_request_id,
        provider_id,
        customer_id,
        customer_name: customer?.full_name || 'Unknown',
        customer_email: customer?.email || 'unknown@email.com',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent in database
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        id: paymentIntent.id,
        service_request_id,
        provider_id,
        customer_id,
        amount,
        currency,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing payment intent:', insertError);
      // Continue anyway, as Stripe payment intent was created successfully
    }

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create payment intent' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function confirmPayment(
  req: Request,
  stripe: Stripe,
  supabase: any
): Promise<Response> {
  try {
    const requestData: PaymentConfirmRequest = await req.json();

    if (!requestData.payment_intent_id || !requestData.service_request_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(requestData.payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status in database
      await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', requestData.payment_intent_id);

      // Update service request status
      await supabase
        .from('service_requests')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestData.service_request_id);

      return new Response(
        JSON.stringify({
          status: 'succeeded',
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          success: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          status: paymentIntent.status,
          payment_intent_id: paymentIntent.id,
          success: false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error confirming payment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to confirm payment' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function refundPayment(
  req: Request,
  stripe: Stripe,
  supabase: any
): Promise<Response> {
  try {
    const requestData: RefundRequest = await req.json();

    if (!requestData.payment_intent_id || !requestData.service_request_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: requestData.payment_intent_id,
      amount: requestData.amount ? Math.round(requestData.amount * 100) : undefined,
      reason: requestData.reason || 'requested_by_customer',
      metadata: {
        service_request_id: requestData.service_request_id
      }
    });

    // Update payment status in database
    await supabase
      .from('payments')
      .update({ 
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refund.amount / 100
      })
      .eq('stripe_payment_intent_id', requestData.payment_intent_id);

    // Update service request status
    await supabase
      .from('service_requests')
      .update({ 
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.service_request_id);

    return new Response(
      JSON.stringify({
        refund_id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing refund:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process refund' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleWebhook(
  req: Request,
  stripe: Stripe,
  supabase: any
): Promise<Response> {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment status
        await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        // Update service request status
        if (paymentIntent.metadata.service_request_id) {
          await supabase
            .from('service_requests')
            .update({ 
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentIntent.metadata.service_request_id);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        await supabase
          .from('payments')
          .update({ 
            status: 'failed',
            failed_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Webhook error', { status: 400 });
  }
}

/* 
Usage examples:

1. Create payment intent:
POST /functions/v1/payment-processing/create-payment-intent
{
  "amount": 15000,
  "currency": "ars",
  "service_request_id": "uuid-here",
  "provider_id": "uuid-here",
  "customer_id": "uuid-here",
  "description": "Cambio de aceite y filtros"
}

2. Confirm payment:
POST /functions/v1/payment-processing/confirm-payment
{
  "payment_intent_id": "pi_xxx",
  "service_request_id": "uuid-here"
}

3. Refund payment:
POST /functions/v1/payment-processing/refund-payment
{
  "payment_intent_id": "pi_xxx",
  "service_request_id": "uuid-here",
  "amount": 7500,
  "reason": "requested_by_customer"
}

4. Webhook endpoint:
POST /functions/v1/payment-processing/webhook
(Stripe webhook events)

Environment variables needed:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
*/