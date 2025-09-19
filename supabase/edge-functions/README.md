# Supabase Edge Functions para RuedApp

Este directorio contiene las Edge Functions de Supabase para RuedApp. Las Edge Functions son funciones serverless que se ejecutan en el edge de Supabase y permiten implementar lógica de backend personalizada.

## Configuración

### Prerrequisitos

1. **Supabase CLI instalado**:
   ```bash
   npm install -g supabase
   ```

2. **Deno instalado** (requerido para Edge Functions):
   ```bash
   # Windows (PowerShell)
   irm https://deno.land/install.ps1 | iex
   
   # macOS/Linux
   curl -fsSL https://deno.land/install.sh | sh
   ```

3. **Autenticación con Supabase**:
   ```bash
   supabase login
   ```

### Inicialización del proyecto

1. **Inicializar Supabase en el proyecto**:
   ```bash
   supabase init
   ```

2. **Vincular con el proyecto remoto**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

## Edge Functions Disponibles

### 1. Notificaciones Push
**Archivo**: `push-notifications/index.ts`
**Propósito**: Enviar notificaciones push a usuarios cuando hay actualizaciones en solicitudes de servicio.

**Uso**:
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/push-notifications' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "uuid",
    "title": "Solicitud actualizada",
    "body": "Tu solicitud de servicio ha sido aceptada",
    "data": { "request_id": "uuid" }
  }'
```

### 2. Cálculo de Distancias
**Archivo**: `calculate-distance/index.ts`
**Propósito**: Calcular distancias entre ubicaciones y encontrar proveedores cercanos.

**Uso**:
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/calculate-distance' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_lat": -34.6037,
    "user_lng": -58.3816,
    "radius_km": 10
  }'
```

### 3. Procesamiento de Pagos
**Archivo**: `process-payment/index.ts`
**Propósito**: Integración con pasarelas de pago para procesar transacciones.

**Uso**:
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/process-payment' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "request_id": "uuid",
    "amount": 5000,
    "currency": "ARS",
    "payment_method": "card"
  }'
```

### 4. Envío de Emails
**Archivo**: `send-email/index.ts`
**Propósito**: Enviar emails transaccionales (confirmaciones, notificaciones, etc.).

**Uso**:
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "user@example.com",
    "template": "service_confirmation",
    "data": { "service_name": "Cambio de aceite" }
  }'
```

## Comandos de Desarrollo

### Crear nueva función
```bash
supabase functions new function-name
```

### Servir funciones localmente
```bash
supabase functions serve
```

### Servir función específica
```bash
supabase functions serve function-name --no-verify-jwt
```

### Desplegar funciones
```bash
# Desplegar todas las funciones
supabase functions deploy

# Desplegar función específica
supabase functions deploy function-name
```

### Ver logs de funciones
```bash
supabase functions logs function-name
```

## Estructura de Archivos

```
supabase/
├── functions/
│   ├── push-notifications/
│   │   └── index.ts
│   ├── calculate-distance/
│   │   └── index.ts
│   ├── process-payment/
│   │   └── index.ts
│   ├── send-email/
│   │   └── index.ts
│   └── _shared/
│       ├── cors.ts
│       ├── auth.ts
│       └── types.ts
└── config.toml
```

## Variables de Entorno

Las Edge Functions pueden acceder a variables de entorno configuradas en el dashboard de Supabase:

```typescript
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');
```

### Configurar variables de entorno

1. Ve al dashboard de Supabase
2. Navega a Settings > Edge Functions
3. Agrega las variables necesarias:
   - `RESEND_API_KEY`: Para envío de emails
   - `STRIPE_SECRET_KEY`: Para procesamiento de pagos
   - `FCM_SERVER_KEY`: Para notificaciones push
   - `GOOGLE_MAPS_API_KEY`: Para cálculos de distancia

## Seguridad

### Autenticación
Las funciones pueden verificar la autenticación del usuario:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const authHeader = req.headers.get('Authorization')!;
const token = authHeader.replace('Bearer ', '');
const { data: { user } } = await supabase.auth.getUser(token);

if (!user) {
  return new Response('Unauthorized', { status: 401 });
}
```

### CORS
Todas las funciones deben manejar CORS para permitir requests desde la app:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

## Testing

### Testing local
```bash
# Iniciar servidor local
supabase functions serve

# Probar función
curl -X POST 'http://localhost:54321/functions/v1/function-name' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{"test": "data"}'
```

### Testing en producción
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/function-name' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": "data"}'
```

## Monitoreo

### Logs en tiempo real
```bash
supabase functions logs --follow
```

### Métricas
Las métricas están disponibles en el dashboard de Supabase:
- Número de invocaciones
- Tiempo de ejecución
- Errores
- Uso de recursos

## Mejores Prácticas

1. **Manejo de errores**: Siempre incluir manejo de errores apropiado
2. **Validación de entrada**: Validar todos los datos de entrada
3. **Timeouts**: Configurar timeouts apropiados para requests externos
4. **Logging**: Usar `console.log` para debugging (visible en logs)
5. **Tipos**: Usar TypeScript para mejor type safety
6. **Reutilización**: Crear funciones compartidas en `_shared/`

## Troubleshooting

### Problemas comunes

1. **Error de CORS**:
   - Verificar que se incluyan los headers de CORS
   - Manejar requests OPTIONS

2. **Error de autenticación**:
   - Verificar que el token JWT sea válido
   - Usar el token correcto (anon key para requests públicos)

3. **Timeout**:
   - Las funciones tienen un límite de tiempo de ejecución
   - Optimizar código para mejor performance

4. **Variables de entorno**:
   - Verificar que estén configuradas en el dashboard
   - Usar nombres exactos (case-sensitive)

### Logs útiles
```bash
# Ver logs de todas las funciones
supabase functions logs

# Ver logs de función específica
supabase functions logs function-name

# Ver logs en tiempo real
supabase functions logs --follow
```

## Recursos Adicionales

- [Documentación oficial de Edge Functions](https://supabase.com/docs/guides/functions)
- [Ejemplos de Edge Functions](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Deno Documentation](https://deno.land/manual)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)