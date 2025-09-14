import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface EmailRequest {
  to: string | string[];
  subject: string;
  template_type: 'welcome' | 'service_confirmation' | 'service_completed' | 'payment_receipt' | 'password_reset' | 'custom';
  template_data?: Record<string, any>;
  html?: string; // For custom emails
  text?: string; // For custom emails
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@ruedapp.com';

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
    const emailData: EmailRequest = await req.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.template_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, template_type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate email content based on template
    const { html, text } = await generateEmailContent(emailData);

    // Prepare email payload for Resend
    const emailPayload = {
      from: FROM_EMAIL,
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: emailData.subject,
      html,
      text
    };

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log email in database
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        email_id: result.id,
        recipient: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        template_type: emailData.template_type,
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider: 'resend'
      });

    if (logError) {
      console.error('Error logging email:', logError);
      // Continue anyway, email was sent successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: result.id,
        message: 'Email sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateEmailContent(emailData: EmailRequest): Promise<{ html: string; text: string }> {
  const { template_type, template_data = {}, html: customHtml, text: customText } = emailData;

  // For custom emails, use provided content
  if (template_type === 'custom') {
    return {
      html: customHtml || '',
      text: customText || ''
    };
  }

  // Generate content based on template type
  switch (template_type) {
    case 'welcome':
      return generateWelcomeEmail(template_data);
    
    case 'service_confirmation':
      return generateServiceConfirmationEmail(template_data);
    
    case 'service_completed':
      return generateServiceCompletedEmail(template_data);
    
    case 'payment_receipt':
      return generatePaymentReceiptEmail(template_data);
    
    case 'password_reset':
      return generatePasswordResetEmail(template_data);
    
    default:
      throw new Error(`Unknown template type: ${template_type}`);
  }
}

function generateWelcomeEmail(data: any): { html: string; text: string } {
  const { user_name = 'Usuario', app_name = 'RuedApp' } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>¡Bienvenido a ${app_name}!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">¡Bienvenido a ${app_name}!</h1>
        <p>Hola ${user_name},</p>
        <p>¡Gracias por registrarte en ${app_name}! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
        <p>Con ${app_name} puedes:</p>
        <ul>
          <li>Encontrar servicios automotrices cerca de ti</li>
          <li>Solicitar servicios para tu vehículo</li>
          <li>Gestionar tus vehículos</li>
          <li>Calificar y reseñar proveedores de servicios</li>
        </ul>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Bienvenido a bordo!</p>
        <p>El equipo de ${app_name}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    ¡Bienvenido a ${app_name}!
    
    Hola ${user_name},
    
    ¡Gracias por registrarte en ${app_name}! Estamos emocionados de tenerte como parte de nuestra comunidad.
    
    Con ${app_name} puedes:
    - Encontrar servicios automotrices cerca de ti
    - Solicitar servicios para tu vehículo
    - Gestionar tus vehículos
    - Calificar y reseñar proveedores de servicios
    
    Si tienes alguna pregunta, no dudes en contactarnos.
    
    ¡Bienvenido a bordo!
    El equipo de ${app_name}
  `;

  return { html, text };
}

function generateServiceConfirmationEmail(data: any): { html: string; text: string } {
  const { 
    user_name = 'Usuario',
    service_name = 'Servicio',
    provider_name = 'Proveedor',
    scheduled_date = 'Fecha por confirmar',
    total_amount = 0,
    vehicle_info = 'Vehículo'
  } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Servicio</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Confirmación de Servicio</h1>
        <p>Hola ${user_name},</p>
        <p>Tu solicitud de servicio ha sido confirmada. Aquí están los detalles:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalles del Servicio</h3>
          <p><strong>Servicio:</strong> ${service_name}</p>
          <p><strong>Proveedor:</strong> ${provider_name}</p>
          <p><strong>Fecha programada:</strong> ${scheduled_date}</p>
          <p><strong>Vehículo:</strong> ${vehicle_info}</p>
          <p><strong>Total:</strong> $${total_amount}</p>
        </div>
        <p>El proveedor se pondrá en contacto contigo para coordinar los detalles.</p>
        <p>¡Gracias por usar RuedApp!</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Confirmación de Servicio
    
    Hola ${user_name},
    
    Tu solicitud de servicio ha sido confirmada. Aquí están los detalles:
    
    Servicio: ${service_name}
    Proveedor: ${provider_name}
    Fecha programada: ${scheduled_date}
    Vehículo: ${vehicle_info}
    Total: $${total_amount}
    
    El proveedor se pondrá en contacto contigo para coordinar los detalles.
    
    ¡Gracias por usar RuedApp!
  `;

  return { html, text };
}

function generateServiceCompletedEmail(data: any): { html: string; text: string } {
  const { 
    user_name = 'Usuario',
    service_name = 'Servicio',
    provider_name = 'Proveedor',
    completion_date = 'Hoy',
    total_amount = 0
  } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Servicio Completado</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a;">¡Servicio Completado!</h1>
        <p>Hola ${user_name},</p>
        <p>Tu servicio ha sido completado exitosamente.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Resumen del Servicio</h3>
          <p><strong>Servicio:</strong> ${service_name}</p>
          <p><strong>Proveedor:</strong> ${provider_name}</p>
          <p><strong>Completado el:</strong> ${completion_date}</p>
          <p><strong>Total pagado:</strong> $${total_amount}</p>
        </div>
        <p>¿Te gustó el servicio? ¡Déjanos una reseña en la app!</p>
        <p>¡Gracias por usar RuedApp!</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    ¡Servicio Completado!
    
    Hola ${user_name},
    
    Tu servicio ha sido completado exitosamente.
    
    Servicio: ${service_name}
    Proveedor: ${provider_name}
    Completado el: ${completion_date}
    Total pagado: $${total_amount}
    
    ¿Te gustó el servicio? ¡Déjanos una reseña en la app!
    
    ¡Gracias por usar RuedApp!
  `;

  return { html, text };
}

function generatePaymentReceiptEmail(data: any): { html: string; text: string } {
  const { 
    user_name = 'Usuario',
    payment_id = 'N/A',
    amount = 0,
    service_name = 'Servicio',
    payment_date = 'Hoy'
  } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recibo de Pago</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Recibo de Pago</h1>
        <p>Hola ${user_name},</p>
        <p>Hemos recibido tu pago exitosamente.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalles del Pago</h3>
          <p><strong>ID de Pago:</strong> ${payment_id}</p>
          <p><strong>Servicio:</strong> ${service_name}</p>
          <p><strong>Monto:</strong> $${amount}</p>
          <p><strong>Fecha:</strong> ${payment_date}</p>
          <p><strong>Estado:</strong> Completado</p>
        </div>
        <p>Guarda este recibo para tus registros.</p>
        <p>¡Gracias por tu pago!</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Recibo de Pago
    
    Hola ${user_name},
    
    Hemos recibido tu pago exitosamente.
    
    ID de Pago: ${payment_id}
    Servicio: ${service_name}
    Monto: $${amount}
    Fecha: ${payment_date}
    Estado: Completado
    
    Guarda este recibo para tus registros.
    
    ¡Gracias por tu pago!
  `;

  return { html, text };
}

function generatePasswordResetEmail(data: any): { html: string; text: string } {
  const { 
    user_name = 'Usuario',
    reset_link = '#',
    expiry_time = '1 hora'
  } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Restablecer Contraseña</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Restablecer Contraseña</h1>
        <p>Hola ${user_name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reset_link}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
        </div>
        <p>Este enlace expirará en ${expiry_time}.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p>El equipo de RuedApp</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Restablecer Contraseña
    
    Hola ${user_name},
    
    Recibimos una solicitud para restablecer tu contraseña.
    
    Haz clic en el siguiente enlace para restablecer tu contraseña:
    ${reset_link}
    
    Este enlace expirará en ${expiry_time}.
    
    Si no solicitaste este cambio, puedes ignorar este email.
    
    El equipo de RuedApp
  `;

  return { html, text };
}

/* 
Usage examples:

1. Welcome email:
POST /functions/v1/send-email
{
  "to": "user@example.com",
  "subject": "¡Bienvenido a RuedApp!",
  "template_type": "welcome",
  "template_data": {
    "user_name": "Juan Pérez",
    "app_name": "RuedApp"
  }
}

2. Service confirmation:
POST /functions/v1/send-email
{
  "to": "user@example.com",
  "subject": "Confirmación de Servicio",
  "template_type": "service_confirmation",
  "template_data": {
    "user_name": "Juan Pérez",
    "service_name": "Cambio de aceite",
    "provider_name": "Taller ABC",
    "scheduled_date": "2024-01-15 10:00",
    "total_amount": 15000,
    "vehicle_info": "Toyota Corolla 2020"
  }
}

3. Custom email:
POST /functions/v1/send-email
{
  "to": ["user1@example.com", "user2@example.com"],
  "subject": "Mensaje personalizado",
  "template_type": "custom",
  "html": "<h1>Hola!</h1><p>Este es un mensaje personalizado.</p>",
  "text": "Hola! Este es un mensaje personalizado."
}

Environment variables needed:
- RESEND_API_KEY
- FROM_EMAIL (optional, defaults to noreply@ruedapp.com)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
*/