# RuedApp Supabase Edge Functions

Este directorio contiene todas las Edge Functions de Supabase para RuedApp, que proporcionan funcionalidades backend serverless para la aplicación.

## 📋 Funciones Disponibles

### 1. 🔔 Push Notifications (`push-notifications`)
**Archivo:** `push-notifications/index.ts`

**Descripción:** Maneja el envío de notificaciones push usando la API de Expo.

**Endpoints:**
- `POST /functions/v1/push-notifications`

**Funcionalidades:**
- Envío de notificaciones push individuales y masivas
- Validación de tokens de Expo
- Registro de notificaciones en base de datos
- Manejo de errores y reintentos
- Soporte para datos personalizados

**Ejemplo de uso:**
```json
{
  "user_id": "uuid-here",
  "title": "Nueva solicitud de servicio",
  "body": "Tienes una nueva solicitud pendiente",
  "data": {
    "type": "service_request",
    "id": "request-uuid"
  }
}
```

### 2. 📍 Calculate Distance (`calculate-distance`)
**Archivo:** `calculate-distance/index.ts`

**Descripción:** Calcula distancias entre ubicaciones y encuentra proveedores cercanos.

**Endpoints:**
- `POST /functions/v1/calculate-distance`

**Funcionalidades:**
- Cálculo de distancias usando fórmula Haversine
- Búsqueda de proveedores por radio
- Filtrado por tipo de servicio y vehículo
- Ordenamiento por distancia
- Estadísticas de búsqueda

**Ejemplo de uso:**
```json
{
  "user_lat": -34.6037,
  "user_lng": -58.3816,
  "radius_km": 25,
  "service_id": "uuid-here",
  "limit": 10
}
```

### 3. 💳 Payment Processing (`payment-processing`)
**Archivo:** `payment-processing/index.ts`

**Descripción:** Procesa pagos usando Stripe y maneja webhooks.

**Endpoints:**
- `POST /functions/v1/payment-processing/create-payment-intent`
- `POST /functions/v1/payment-processing/confirm-payment`
- `POST /functions/v1/payment-processing/refund-payment`
- `POST /functions/v1/payment-processing/webhook`

**Funcionalidades:**
- Creación de Payment Intents
- Confirmación de pagos
- Procesamiento de reembolsos
- Manejo de webhooks de Stripe
- Validación de montos y servicios
- Registro de transacciones

**Ejemplo de uso:**
```json
{
  "amount": 15000,
  "currency": "ars",
  "service_request_id": "uuid-here",
  "provider_id": "uuid-here",
  "customer_id": "uuid-here"
}
```

### 4. 📧 Send Email (`send-email`)
**Archivo:** `send-email/index.ts`

**Descripción:** Envía emails usando Resend con plantillas predefinidas.

**Endpoints:**
- `POST /functions/v1/send-email`

**Funcionalidades:**
- Plantillas de email predefinidas
- Emails personalizados
- Registro de envíos
- Soporte para múltiples destinatarios
- Plantillas responsive

**Plantillas disponibles:**
- `welcome` - Email de bienvenida
- `service_confirmation` - Confirmación de servicio
- `service_completed` - Servicio completado
- `payment_receipt` - Recibo de pago
- `password_reset` - Restablecimiento de contraseña
- `custom` - Email personalizado

**Ejemplo de uso:**
```json
{
  "to": "user@example.com",
  "subject": "¡Bienvenido a RuedApp!",
  "template_type": "welcome",
  "template_data": {
    "user_name": "Juan Pérez"
  }
}
```

### 5. 🔧 Service Management (`service-management`)
**Archivo:** `service-management/index.ts`

**Descripción:** Gestiona solicitudes de servicios y disponibilidad de proveedores.

**Endpoints:**
- `POST /functions/v1/service-management/create-request`
- `POST /functions/v1/service-management/update-request`
- `POST /functions/v1/service-management/cancel-request`
- `GET /functions/v1/service-management/get-availability`
- `POST /functions/v1/service-management/calculate-price`
- `GET /functions/v1/service-management/get-requests`

**Funcionalidades:**
- Creación de solicitudes de servicio
- Actualización de estados
- Cancelación de servicios
- Consulta de disponibilidad
- Cálculo de precios dinámicos
- Notificaciones automáticas

**Ejemplo de uso:**
```json
{
  "user_id": "uuid-here",
  "provider_id": "uuid-here",
  "vehicle_id": "uuid-here",
  "service_id": "uuid-here",
  "scheduled_date": "2024-01-15T10:00:00Z",
  "location": {
    "latitude": -34.6037,
    "longitude": -58.3816,
    "address": "Av. Corrientes 1234, CABA"
  }
}
```

## 🚀 Despliegue

### Prerrequisitos
1. Supabase CLI instalado
2. Proyecto de Supabase configurado
3. Variables de entorno configuradas

### Comandos de despliegue

```bash
# Desplegar todas las funciones
supabase functions deploy

# Desplegar una función específica
supabase functions deploy push-notifications
supabase functions deploy calculate-distance
supabase functions deploy payment-processing
supabase functions deploy send-email
supabase functions deploy service-management

# Servir funciones localmente para desarrollo
supabase functions serve

# Servir una función específica
supabase functions serve push-notifications --env-file .env.local
```

### Variables de entorno requeridas

Copia `.env.example` a `.env.local` y configura las siguientes variables:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Expo (Push Notifications)
EXPO_ACCESS_TOKEN=your-expo-access-token

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Resend (Email)
RESEND_API_KEY=re_your-resend-api-key
FROM_EMAIL=noreply@ruedapp.com
```

## 🧪 Testing

### Testing local

```bash
# Iniciar funciones localmente
supabase functions serve --env-file .env.local

# Probar push notifications
curl -X POST 'http://localhost:54321/functions/v1/push-notifications' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user-id",
    "title": "Test Notification",
    "body": "This is a test notification"
  }'

# Probar cálculo de distancia
curl -X POST 'http://localhost:54321/functions/v1/calculate-distance' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_lat": -34.6037,
    "user_lng": -58.3816,
    "radius_km": 10
  }'
```

### Testing en producción

```bash
# Reemplaza YOUR_PROJECT_URL con tu URL de Supabase
curl -X POST 'https://YOUR_PROJECT_URL/functions/v1/push-notifications' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user-id",
    "title": "Production Test",
    "body": "Testing in production"
  }'
```

## 📊 Monitoreo

### Logs de funciones

```bash
# Ver logs de todas las funciones
supabase functions logs

# Ver logs de una función específica
supabase functions logs push-notifications

# Ver logs en tiempo real
supabase functions logs --follow
```

### Métricas disponibles

- **Invocaciones:** Número total de llamadas a cada función
- **Duración:** Tiempo promedio de ejecución
- **Errores:** Tasa de errores por función
- **Uso de memoria:** Consumo de memoria por invocación

## 🔒 Seguridad

### Autenticación

Todas las funciones requieren autenticación mediante:
- Header `Authorization: Bearer <anon_key>` para funciones públicas
- Header `Authorization: Bearer <service_role_key>` para operaciones administrativas

### CORS

Todas las funciones incluyen headers CORS configurados para:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`

### Validación de datos

Cada función incluye:
- Validación de parámetros requeridos
- Sanitización de inputs
- Verificación de permisos
- Manejo seguro de errores

## 🛠️ Desarrollo

### Estructura de archivos

```
supabase/functions/
├── .env.example                 # Plantilla de variables de entorno
├── README.md                    # Esta documentación
├── push-notifications/
│   └── index.ts                # Función de notificaciones push
├── calculate-distance/
│   └── index.ts                # Función de cálculo de distancias
├── payment-processing/
│   └── index.ts                # Función de procesamiento de pagos
├── send-email/
│   └── index.ts                # Función de envío de emails
└── service-management/
    └── index.ts                # Función de gestión de servicios
```

### Convenciones de código

1. **TypeScript:** Todas las funciones están escritas en TypeScript
2. **Error Handling:** Manejo consistente de errores con try-catch
3. **CORS:** Headers CORS incluidos en todas las respuestas
4. **Logging:** Console.log para debugging y console.error para errores
5. **Validación:** Validación de inputs en todas las funciones

### Agregar nueva función

1. Crear directorio para la función:
```bash
mkdir supabase/functions/nueva-funcion
```

2. Crear archivo `index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Tu lógica aquí

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

3. Desplegar la función:
```bash
supabase functions deploy nueva-funcion
```

## 🔄 Integración con la App

### Desde React Native

```typescript
import { supabase } from '../lib/supabase';

// Llamar a una Edge Function
const { data, error } = await supabase.functions.invoke('push-notifications', {
  body: {
    user_id: 'user-uuid',
    title: 'Notificación de prueba',
    body: 'Este es un mensaje de prueba'
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Respuesta:', data);
}
```

### Desde el Hook personalizado

```typescript
// En hooks/useSupabase.ts
const sendPushNotification = async (notificationData: NotificationData) => {
  try {
    const { data, error } = await supabase.functions.invoke('push-notifications', {
      body: notificationData
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
```

## 📈 Performance

### Optimizaciones implementadas

1. **Conexión reutilizable:** Cliente Supabase reutilizado en cada función
2. **Validación temprana:** Validación de inputs antes de operaciones costosas
3. **Manejo de errores:** Respuestas rápidas en caso de error
4. **Logging eficiente:** Logs estructurados para debugging

### Límites y consideraciones

- **Timeout:** 60 segundos máximo por invocación
- **Memoria:** 512MB máximo por función
- **Payload:** 6MB máximo para request/response
- **Concurrencia:** 1000 invocaciones simultáneas por función

## 🐛 Troubleshooting

### Problemas comunes

1. **Error de CORS:**
   - Verificar que los headers CORS estén incluidos
   - Manejar requests OPTIONS correctamente

2. **Variables de entorno:**
   - Verificar que todas las variables estén configuradas
   - Usar `supabase secrets list` para ver secrets configurados

3. **Timeouts:**
   - Optimizar consultas a base de datos
   - Implementar timeouts en llamadas externas

4. **Errores de autenticación:**
   - Verificar que el token sea válido
   - Usar service role key para operaciones administrativas

### Comandos útiles

```bash
# Ver estado de las funciones
supabase functions list

# Ver logs de errores
supabase functions logs --level error

# Reiniciar función
supabase functions deploy function-name --no-verify-jwt

# Ver métricas
supabase functions stats
```

## 📚 Recursos adicionales

- [Documentación oficial de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Resend API Documentation](https://resend.com/docs)

## 🤝 Contribución

Para contribuir a las Edge Functions:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcion`
3. Implementa tu función siguiendo las convenciones
4. Agrega tests y documentación
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**Última actualización:** Enero 2024
**Versión:** 1.0.0
**Mantenido por:** Equipo de desarrollo RuedApp